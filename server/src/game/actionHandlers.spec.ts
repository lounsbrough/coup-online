import { vi, type MockInstance, describe, it, expect, afterEach } from 'vitest'
import Chance from 'chance'
import { Actions, EventMessages, Factions, Influences, Responses } from '../../../shared/types/game'
import {
  actionChallengeResponseHandler,
  actionHandler,
  actionResponseHandler,
  blockChallengeResponseHandler,
  blockResponseHandler,
  createGameHandler,
  examineDecisionHandler,
  forfeitGameHandler,
  joinGameHandler,
  loseInfluencesHandler,
  removeFromGameHandler,
  resetGameHandler,
  resetGameRequestCancelHandler,
  resetGameRequestHandler,
  revealForExamineHandler,
  startGameHandler,
} from './actionHandlers'
import { getValue, setValue } from '../utilities/storage'
import { getGameState, mutateGameState } from '../utilities/gameState'
import * as identifiers from '../utilities/identifiers'
import {
  ActionNotChallengeableError,
  ActionNotCurrentlyAllowedError,
  BlockMayNotBeBlockedError,
  CannotTargetSameFactionError,
  ClaimedInfluenceAlreadyConfirmedError,
  ClaimedInfluenceInvalidError,
  ClaimedInfluenceRequiredError,
  DifferentPlayerNameError,
  GameInProgressError,
  GameNotInProgressError,
  InsufficientCoinsError,
  InvalidActionAt10CoinsError,
  MissingInfluenceError,
  PlayerNotInGameError,
  RoomIdAlreadyExistsError,
  SpeedRoundTimerExpiredError,
  TargetPlayerIsSelfError,
  TargetPlayerRequiredForActionError,
  UnableToForfeitError,
} from '../utilities/errors'

vi.mock('../utilities/storage')

const getValueMock = vi.mocked(getValue)
const setValueMock = vi.mocked(setValue)

const inMemoryStorage: {
  [key: string]: Buffer;
} = {}

getValueMock.mockImplementation(async (key: string) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.floor(Math.random() * 10))
  })
  return inMemoryStorage[key] ?? null
})

setValueMock.mockImplementation(async (key: string, value: Buffer) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.floor(Math.random() * 10))
  })
  inMemoryStorage[key] = value
})

const chance = new Chance()

describe('actionHandlers', () => {
  let generateRoomIdSpy: MockInstance | undefined
  afterEach(() => {
    generateRoomIdSpy?.mockRestore()
  })

  describe('game scenarios', () => {
    const [david, marissa, harper, hailey] = [
      'David',
      'Marissa',
      'Harper',
      'Hailey',
    ].map((name) => ({
      playerName: name,
      playerId: chance.string({ length: 10 }),
    }))

    const setupTestGame = async (
      players: {
        playerId: string;
        playerName: string;
        coins?: number;
        influences?: Influences[];
        deadInfluences?: Influences[];
      }[],
      settings?: Record<string, unknown>,
    ) => {
      const { roomId } = await createGameHandler({
        ...players[0],
        settings: { eventLogRetentionTurns: 100, allowRevive: true, ...settings },
      })

      for (const player of players) {
        await joinGameHandler({ roomId, ...player })
      }
      await startGameHandler({
        roomId,
        playerId: chance.pickone(players).playerId,
      })

      await mutateGameState(await getGameState(roomId), (state) => {
        const influencesUsed: Influences[] = []
        state.players = players.map((player) => {
          const statePlayer = state.players.find(
            ({ name }) => player.playerName === name,
          )!
          if (player.influences) {
            state.deck.push(...statePlayer.influences.splice(0))
            statePlayer.influences.push(...player.influences)
            influencesUsed.push(...player.influences)
          }
          if (player.deadInfluences) {
            statePlayer.deadInfluences.push(...player.deadInfluences)
            influencesUsed.push(...player.deadInfluences)
          }
          return {
            ...statePlayer,
            coins: player.coins ?? statePlayer.coins,
          }
        })
        influencesUsed.forEach((influence: Influences) => {
          state.deck.splice(
            state.deck.findIndex((i) => i === influence),
            1,
          )
        })

        state.turnPlayer = players[0].playerName
      })

      return roomId
    }

    it('creating, joining, resetting game', async () => {
      const { roomId } = await createGameHandler({
        ...harper,
        settings: { eventLogRetentionTurns: 100, allowRevive: true },
      })

      await joinGameHandler({ roomId, ...hailey, playerName: 'not hailey' })
      await joinGameHandler({ roomId: roomId.toLowerCase(), ...hailey })

      await startGameHandler({ roomId, playerId: harper.playerId })
      await expect(
        startGameHandler({ roomId, playerId: harper.playerId }),
      ).rejects.toThrow(GameInProgressError)
      await expect(
        removeFromGameHandler({
          roomId,
          playerId: hailey.playerId,
          playerName: david.playerName,
        }),
      ).rejects.toThrow(GameInProgressError)
      await expect(joinGameHandler({ roomId, ...david })).rejects.toThrow(
        GameInProgressError,
      )
      await expect(
        resetGameHandler({ roomId, playerId: hailey.playerId }),
      ).rejects.toThrow(GameInProgressError)
      await expect(
        joinGameHandler({ roomId, ...hailey, playerName: 'new hailey' }),
      ).rejects.toThrow(DifferentPlayerNameError)

      await mutateGameState(await getGameState(roomId), (state) => {
        state.players
          .slice(1)
          .forEach((player) =>
            player.deadInfluences.push(...player.influences.splice(0)),
          )
      })

      await resetGameHandler({ roomId, playerId: hailey.playerId })
      await expect(
        resetGameHandler({ roomId, playerId: hailey.playerId }),
      ).rejects.toThrow(GameNotInProgressError)

      await startGameHandler({ roomId, playerId: harper.playerId })
      await expect(
        resetGameRequestHandler({ roomId, playerId: david.playerId }),
      ).rejects.toThrow(PlayerNotInGameError)
      await resetGameRequestHandler({ roomId, playerId: hailey.playerId })
      await resetGameRequestCancelHandler({
        roomId,
        playerId: harper.playerId,
      })
      await resetGameRequestCancelHandler({
        roomId,
        playerId: hailey.playerId,
      })
      await expect(
        resetGameHandler({ roomId, playerId: harper.playerId }),
      ).rejects.toThrow(GameInProgressError)
      await resetGameRequestHandler({ roomId, playerId: hailey.playerId })
      await expect(
        resetGameHandler({ roomId, playerId: david.playerId }),
      ).rejects.toThrow(PlayerNotInGameError)
      await resetGameHandler({ roomId, playerId: harper.playerId })
      await resetGameRequestHandler({ roomId, playerId: hailey.playerId })

      await joinGameHandler({ roomId, ...marissa })
      await startGameHandler({ roomId, playerId: harper.playerId })

      await mutateGameState(await getGameState(roomId), (state) => {
        const harperPlayer = state.players.find(
          ({ name }) => name === harper.playerName,
        )
        harperPlayer!.deadInfluences.push(
          ...harperPlayer!.influences.splice(0),
        )
        state.turnPlayer = hailey.playerName
      })

      await resetGameRequestHandler({ roomId, playerId: hailey.playerId })
      await expect(
        resetGameHandler({ roomId, playerId: harper.playerId }),
      ).rejects.toThrow(GameInProgressError)
      await resetGameHandler({ roomId, playerId: marissa.playerId })

      await joinGameHandler({ roomId, ...david })
      await removeFromGameHandler({
        roomId,
        playerId: hailey.playerId,
        playerName: david.playerName,
      })
      await expect(
        removeFromGameHandler({
          roomId,
          playerId: hailey.playerId,
          playerName: david.playerName,
        }),
      ).rejects.toThrow(PlayerNotInGameError)

      await startGameHandler({ roomId, playerId: hailey.playerId })
      await expect(
        startGameHandler({ roomId, playerId: harper.playerId }),
      ).rejects.toThrow(GameInProgressError)
    })

    it('creating new game can not wipe out existing game when room id conflicts', async () => {
      generateRoomIdSpy = vi
        .spyOn(identifiers, 'generateRoomId')
        .mockReturnValue('DUPLICATE')

      await createGameHandler({
        ...harper,
        settings: { eventLogRetentionTurns: 100, allowRevive: true },
      })

      await expect(
        createGameHandler({
          ...harper,
          settings: { eventLogRetentionTurns: 100, allowRevive: true },
        }),
      ).rejects.toThrow(RoomIdAlreadyExistsError)
    })

    it('starting game with useInquisitor builds deck without Ambassador', async () => {
      const { roomId } = await createGameHandler({
        ...harper,
        settings: { eventLogRetentionTurns: 100, allowRevive: true, useInquisitor: true },
      })
      await joinGameHandler({ roomId, ...hailey })
      await startGameHandler({ roomId, playerId: harper.playerId })

      const gameState = await getGameState(roomId)
      const allCards = [
        ...gameState.deck,
        ...gameState.players.flatMap((p) => [...p.influences, ...p.deadInfluences]),
      ]

      expect(allCards).not.toContain(Influences.Ambassador)
      expect(allCards).toContain(Influences.Inquisitor)
    })

    it('starting game without useInquisitor builds deck without Inquisitor', async () => {
      const { roomId } = await createGameHandler({
        ...harper,
        settings: { eventLogRetentionTurns: 100, allowRevive: true },
      })
      await joinGameHandler({ roomId, ...hailey })
      await startGameHandler({ roomId, playerId: harper.playerId })

      const gameState = await getGameState(roomId)
      const allCards = [
        ...gameState.deck,
        ...gameState.players.flatMap((p) => [...p.influences, ...p.deadInfluences]),
      ]

      expect(allCards).not.toContain(Influences.Inquisitor)
      expect(allCards).toContain(Influences.Ambassador)
    })

    it('everyone passes on action', async () => {
      const roomId = await setupTestGame([david, harper, hailey])

      await expect(
        actionHandler({
          roomId,
          playerId: harper.playerId,
          action: Actions.Tax,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)
      await expect(
        actionHandler({
          roomId,
          playerId: hailey.playerId,
          action: Actions.Tax,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)
      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Tax,
      })
      await expect(
        actionHandler({
          roomId,
          playerId: david.playerId,
          action: Actions.Tax,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)

      await expect(
        actionResponseHandler({
          roomId,
          playerId: david.playerId,
          response: Responses.Pass,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })
      await expect(
        actionResponseHandler({
          roomId,
          playerId: harper.playerId,
          response: Responses.Pass,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)

      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Pass,
      })
      await expect(
        actionResponseHandler({
          roomId,
          playerId: hailey.playerId,
          response: Responses.Pass,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(5)
    })

    it('tax -> successful challenge -> tax and lost influence', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Ambassador] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Tax,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      await expect(
        actionChallengeResponseHandler({
          roomId,
          playerId: harper.playerId,
          influence: Influences.Contessa,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)
      await expect(
        actionChallengeResponseHandler({
          roomId,
          playerId: hailey.playerId,
          influence: Influences.Assassin,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)

      await expect(
        actionChallengeResponseHandler({
          roomId,
          playerId: david.playerId,
          influence: Influences.Duke,
        }),
      ).rejects.toThrow(MissingInfluenceError)
      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Captain,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
      expect(gameState.players[0].influences).toHaveLength(1)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.players[1].coins).toBe(2)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('steal -> failed challenge -> block -> failed challenge -> steal and 2 lost influences', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Ambassador] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.ForeignAid,
      })
      await expect(
        actionResponseHandler({
          roomId,
          playerId: harper.playerId,
          response: Responses.Challenge,
        }),
      ).rejects.toThrow(ActionNotChallengeableError)
      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })
      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Pass,
      })

      await expect(
        actionHandler({
          roomId,
          playerId: harper.playerId,
          action: Actions.Steal,
        }),
      ).rejects.toThrow(TargetPlayerRequiredForActionError)
      await actionHandler({
        roomId,
        playerId: harper.playerId,
        action: Actions.Steal,
        targetPlayer: hailey.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: david.playerId,
        response: Responses.Challenge,
      })

      await expect(
        actionChallengeResponseHandler({
          roomId,
          playerId: david.playerId,
          influence: Influences.Contessa,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)
      await expect(
        actionChallengeResponseHandler({
          roomId,
          playerId: hailey.playerId,
          influence: Influences.Assassin,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)

      await actionChallengeResponseHandler({
        roomId,
        playerId: harper.playerId,
        influence: Influences.Captain,
      })

      await expect(
        loseInfluencesHandler({
          roomId,
          playerId: david.playerId,
          influences: [Influences.Assassin],
        }),
      ).rejects.toThrow(MissingInfluenceError)
      await loseInfluencesHandler({
        roomId,
        playerId: david.playerId,
        influences: [Influences.Ambassador],
      })

      await expect(
        actionResponseHandler({
          roomId,
          playerId: hailey.playerId,
          response: Responses.Challenge,
        }),
      ).rejects.toThrow(ClaimedInfluenceAlreadyConfirmedError)
      await expect(
        actionResponseHandler({
          roomId,
          playerId: hailey.playerId,
          response: Responses.Block,
        }),
      ).rejects.toThrow(ClaimedInfluenceRequiredError)
      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Ambassador,
      })

      await blockResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })
      await blockResponseHandler({
        roomId,
        playerId: david.playerId,
        response: Responses.Challenge,
      })

      await blockChallengeResponseHandler({
        roomId,
        playerId: hailey.playerId,
        influence: Influences.Ambassador,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(hailey.playerName)
      expect(gameState.players[0].influences).toHaveLength(0)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(4)
      expect(gameState.players[1].coins).toBe(2)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('steal -> block -> failed challenge -> no steal and lost influence', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Ambassador] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Income,
      })
      await actionHandler({
        roomId,
        playerId: harper.playerId,
        action: Actions.Income,
      })

      await actionHandler({
        roomId,
        playerId: hailey.playerId,
        action: Actions.Steal,
        targetPlayer: david.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: david.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Captain,
      })

      await blockResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Challenge,
      })

      await expect(
        blockChallengeResponseHandler({
          roomId,
          playerId: david.playerId,
          influence: Influences.Contessa,
        }),
      ).rejects.toThrow(MissingInfluenceError)
      await expect(
        blockChallengeResponseHandler({
          roomId,
          playerId: harper.playerId,
          influence: Influences.Contessa,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)
      await expect(
        blockChallengeResponseHandler({
          roomId,
          playerId: hailey.playerId,
          influence: Influences.Assassin,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)
      await blockChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Captain,
      })

      await loseInfluencesHandler({
        roomId,
        playerId: hailey.playerId,
        influences: [Influences.Ambassador],
      })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(1)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('assassinate -> block -> pass -> coins spent and no influences lost', async () => {
      const roomId = await setupTestGame([
        david,
        harper,
        { ...hailey, coins: 3 },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Income,
      })
      await actionHandler({
        roomId,
        playerId: harper.playerId,
        action: Actions.Income,
      })

      await actionHandler({
        roomId,
        playerId: hailey.playerId,
        action: Actions.Assassinate,
        targetPlayer: david.playerName,
      })

      await expect(
        actionResponseHandler({
          roomId,
          playerId: david.playerId,
          response: Responses.Block,
          claimedInfluence: Influences.Captain,
        }),
      ).rejects.toThrow(ClaimedInfluenceInvalidError)
      await actionResponseHandler({
        roomId,
        playerId: david.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Contessa,
      })

      await blockResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Pass,
      })
      await blockResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('exchange -> pass -> influences replaced', async () => {
      const roomId = await setupTestGame([david, harper, hailey])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Exchange,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })
      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Pass,
      })

      let gameState = await getGameState(roomId)

      await loseInfluencesHandler({
        roomId,
        playerId: david.playerId,
        influences: chance.pickset(gameState.players[0].influences, 2),
      })

      gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.players[1].coins).toBe(2)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('coup', async () => {
      const roomId = await setupTestGame([
        david,
        harper,
        { ...hailey, coins: 7 },
      ])

      await expect(
        actionHandler({
          roomId,
          playerId: david.playerId,
          action: Actions.Coup,
          targetPlayer: hailey.playerName,
        }),
      ).rejects.toThrow(InsufficientCoinsError)
      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Income,
      })
      await expect(
        actionHandler({
          roomId,
          playerId: harper.playerId,
          action: Actions.Coup,
          targetPlayer: hailey.playerName,
        }),
      ).rejects.toThrow(InsufficientCoinsError)
      await actionHandler({
        roomId,
        playerId: harper.playerId,
        action: Actions.Income,
      })

      await expect(
        actionHandler({
          roomId,
          playerId: hailey.playerId,
          action: Actions.Coup,
          targetPlayer: hailey.playerName,
        }),
      ).rejects.toThrow(TargetPlayerIsSelfError)
      await actionHandler({
        roomId,
        playerId: hailey.playerId,
        action: Actions.Coup,
        targetPlayer: david.playerName,
      })
      await expect(
        actionHandler({
          roomId,
          playerId: hailey.playerId,
          action: Actions.Income,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)

      let gameState = await getGameState(roomId)

      await loseInfluencesHandler({
        roomId,
        playerId: david.playerId,
        influences: [chance.pickone(gameState.players[0].influences)],
      })

      gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(1)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('revive', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Duke, Influences.Contessa] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        {
          ...hailey,
          coins: 10,
          influences: [Influences.Assassin],
          deadInfluences: [Influences.Captain],
        },
      ])

      await expect(
        actionHandler({
          roomId,
          playerId: david.playerId,
          action: Actions.Revive,
        }),
      ).rejects.toThrow(InsufficientCoinsError)
      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Income,
      })
      await expect(
        actionHandler({
          roomId,
          playerId: harper.playerId,
          action: Actions.Revive,
        }),
      ).rejects.toThrow(InsufficientCoinsError)
      await actionHandler({
        roomId,
        playerId: harper.playerId,
        action: Actions.Income,
      })

      await expect(
        actionHandler({
          roomId,
          playerId: hailey.playerId,
          action: Actions.Income,
        }),
      ).rejects.toThrow(InvalidActionAt10CoinsError)
      await actionHandler({
        roomId,
        playerId: hailey.playerId,
        action: Actions.Revive,
      })
      await expect(
        actionHandler({
          roomId,
          playerId: hailey.playerId,
          action: Actions.Income,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('assassination -> failed challenge -> last influence killed', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        {
          ...harper,
          influences: [Influences.Captain],
          deadInfluences: [Influences.Ambassador],
        },
        {
          ...hailey,
          influences: [Influences.Captain, Influences.Assassin],
          coins: 3,
        },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Income,
      })
      await actionHandler({
        roomId,
        playerId: harper.playerId,
        action: Actions.Income,
      })
      await actionHandler({
        roomId,
        playerId: hailey.playerId,
        action: Actions.Assassinate,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      await actionChallengeResponseHandler({
        roomId,
        playerId: hailey.playerId,
        influence: Influences.Assassin,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(0)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('assassination -> failed challenge -> both influences killed', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        {
          ...hailey,
          influences: [Influences.Captain, Influences.Assassin],
          coins: 3,
        },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Income,
      })
      await actionHandler({
        roomId,
        playerId: harper.playerId,
        action: Actions.Income,
      })
      await actionHandler({
        roomId,
        playerId: hailey.playerId,
        action: Actions.Assassinate,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      await actionChallengeResponseHandler({
        roomId,
        playerId: hailey.playerId,
        influence: Influences.Assassin,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Contessa,
      })

      await blockResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Challenge,
      })

      await blockChallengeResponseHandler({
        roomId,
        playerId: harper.playerId,
        influence: Influences.Ambassador,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(0)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('assassination -> block -> successful challenge -> both influences killed', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        {
          ...hailey,
          influences: [Influences.Captain, Influences.Assassin],
          coins: 3,
        },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Income,
      })
      await actionHandler({
        roomId,
        playerId: harper.playerId,
        action: Actions.Income,
      })
      await actionHandler({
        roomId,
        playerId: hailey.playerId,
        action: Actions.Assassinate,
        targetPlayer: david.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: david.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Contessa,
      })

      await blockResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Challenge,
      })

      await blockChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Captain,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
      expect(gameState.players[0].influences).toHaveLength(0)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('assassination -> failed challenge -> successful block', async () => {
      const roomId = await setupTestGame([
        {
          ...david,
          influences: [Influences.Captain],
          deadInfluences: [Influences.Ambassador],
        },
        {
          ...harper,
          influences: [Influences.Ambassador],
          deadInfluences: [Influences.Captain],
        },
        {
          ...hailey,
          influences: [Influences.Captain, Influences.Assassin],
          coins: 3,
        },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Income,
      })
      await actionHandler({
        roomId,
        playerId: harper.playerId,
        action: Actions.Income,
      })
      await actionHandler({
        roomId,
        playerId: hailey.playerId,
        action: Actions.Assassinate,
        targetPlayer: david.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      await actionChallengeResponseHandler({
        roomId,
        playerId: hailey.playerId,
        influence: Influences.Assassin,
      })

      await expect(
        actionResponseHandler({
          roomId,
          playerId: david.playerId,
          response: Responses.Block,
          claimedInfluence: Influences.Ambassador,
        }),
      ).rejects.toThrow(ClaimedInfluenceInvalidError)
      await actionResponseHandler({
        roomId,
        playerId: david.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Contessa,
      })

      await blockResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(1)
      expect(gameState.players[1].influences).toHaveLength(0)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('tax -> failed challenge -> tax and lost influence', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Ambassador] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Tax,
      })

      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Challenge,
      })

      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Duke,
      })

      await loseInfluencesHandler({
        roomId,
        playerId: hailey.playerId,
        influences: [Influences.Ambassador],
      })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(1)
      expect(gameState.players[0].coins).toBe(5)
      expect(gameState.players[1].coins).toBe(2)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('multiple coups sent to server in rapid succession', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 11 },
        harper,
        hailey,
      ])

      const results = await Promise.allSettled(
        Array.from({ length: 100 }, () =>
          actionHandler({
            roomId,
            playerId: david.playerId,
            action: Actions.Coup,
            targetPlayer: harper.playerName,
          }),
        ),
      )

      expect(results.some(({ status }) => status === 'rejected')).toBe(true)

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(4)
    })

    it('steal -> failed challenge -> lost influence before new action response', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Assassin] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Steal,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Challenge,
      })

      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Captain,
      })

      await loseInfluencesHandler({
        roomId,
        playerId: hailey.playerId,
        influences: [Influences.Assassin],
      })

      let gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('steal -> failed challenge -> lost influence after new action response', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Assassin] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Steal,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Challenge,
      })

      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Captain,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      let gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)

      await loseInfluencesHandler({
        roomId,
        playerId: hailey.playerId,
        influences: [Influences.Assassin],
      })

      gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('convert other player -> faction changes and coins go to treasury', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 4, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
        { ...hailey, influences: [Influences.Assassin, Influences.Duke] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.treasury = 0
        state.players[0].faction = Factions.Loyalist
        state.players[1].faction = Factions.Reformist
        state.players[2].faction = Factions.Loyalist
      })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Convert,
        targetPlayer: harper.playerName,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.treasury).toBe(2)
      expect(gameState.players[1].faction).toBe(Factions.Loyalist)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('convert self -> faction changes and 1 coin goes to treasury', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 3, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.treasury = 0
        state.players[0].faction = Factions.Loyalist
        state.players[1].faction = Factions.Reformist
      })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Convert,
        targetPlayer: david.playerName,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.treasury).toBe(1)
      expect(gameState.players[0].faction).toBe(Factions.Reformist)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('convert not allowed when reformation disabled', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 4, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await expect(
        actionHandler({
          roomId,
          playerId: david.playerId,
          action: Actions.Convert,
          targetPlayer: harper.playerName,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)
    })

    it('should allow convert when all same faction', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 4, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.treasury = 0
        state.players[0].faction = Factions.Loyalist
        state.players[1].faction = Factions.Loyalist
      })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Convert,
        targetPlayer: harper.playerName,
      })

      const gameState = await getGameState(roomId)
      expect(gameState.players[1].faction).toBe(Factions.Reformist)
    })

    it('embezzle -> pass -> takes all treasury coins', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
        { ...hailey, influences: [Influences.Assassin, Influences.Duke] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.treasury = 5
        state.players[0].faction = Factions.Loyalist
        state.players[1].faction = Factions.Reformist
        state.players[2].faction = Factions.Loyalist
      })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Embezzle,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })
      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(7)
      expect(gameState.treasury).toBe(0)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('embezzle -> inverse challenge succeeds (player has Duke) -> loses influence', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.treasury = 5
        state.players[0].faction = Factions.Loyalist
        state.players[1].faction = Factions.Reformist
      })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Embezzle,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      let gameState = await getGameState(roomId)

      // Inverse challenge: David HAS a Duke, so challenge succeeds
      expect(gameState.pendingInfluenceLoss[david.playerName]).toHaveLength(1)
      expect(gameState.treasury).toBe(5)

      await loseInfluencesHandler({
        roomId,
        playerId: david.playerId,
        influences: [Influences.Captain],
      })

      gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('embezzle -> inverse challenge fails (player has no Duke) -> embezzle succeeds', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Assassin] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.treasury = 5
        state.players[0].faction = Factions.Loyalist
        state.players[1].faction = Factions.Reformist
      })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Embezzle,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      let gameState = await getGameState(roomId)

      // Inverse challenge: David does NOT have a Duke, so challenge fails
      expect(gameState.pendingInfluenceLoss[harper.playerName]).toHaveLength(1)

      await loseInfluencesHandler({
        roomId,
        playerId: harper.playerId,
        influences: [Influences.Ambassador],
      })

      gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(7)
      expect(gameState.treasury).toBe(0)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('examine -> pass -> reveal -> force swap', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Inquisitor, Influences.Contessa] },
      ], { useInquisitor: true })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Examine,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      let gameState = await getGameState(roomId)

      expect(gameState.pendingExamine).toBeDefined()
      expect(gameState.pendingExamine!.examiner).toBe(david.playerName)
      expect(gameState.pendingExamine!.targetPlayer).toBe(harper.playerName)

      await revealForExamineHandler({
        roomId,
        playerId: harper.playerId,
        influence: Influences.Inquisitor,
      })

      gameState = await getGameState(roomId)

      expect(gameState.pendingExamine!.revealedInfluence).toBe(Influences.Inquisitor)

      await examineDecisionHandler({
        roomId,
        playerId: david.playerId,
        forceSwap: true,
      })

      gameState = await getGameState(roomId)

      expect(gameState.pendingExamine).toBeUndefined()
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('examine -> pass -> reveal -> allow keep', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Inquisitor, Influences.Contessa] },
      ], { useInquisitor: true })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Examine,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      await revealForExamineHandler({
        roomId,
        playerId: harper.playerId,
        influence: Influences.Contessa,
      })

      await examineDecisionHandler({
        roomId,
        playerId: david.playerId,
        forceSwap: false,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.pendingExamine).toBeUndefined()
      expect(gameState.players[1].influences).toContain(Influences.Contessa)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('examine not allowed when inquisitor disabled', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await expect(
        actionHandler({
          roomId,
          playerId: david.playerId,
          action: Actions.Examine,
          targetPlayer: harper.playerName,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)
    })

    it('examine -> failed challenge -> examine proceeds without extra pass', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Inquisitor, Influences.Duke] },
        { ...harper, influences: [Influences.Captain, Influences.Contessa] },
      ], { useInquisitor: true })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Examine,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Inquisitor,
      })

      await loseInfluencesHandler({
        roomId,
        playerId: harper.playerId,
        influences: [Influences.Captain],
      })

      const gameState = await getGameState(roomId)

      // Examine should proceed directly — no pending action response needed
      expect(gameState.pendingAction).toBeUndefined()
      expect(gameState.pendingExamine).toBeDefined()
      expect(gameState.pendingExamine!.examiner).toBe(david.playerName)
      expect(gameState.pendingExamine!.targetPlayer).toBe(harper.playerName)
    })

    it('faction targeting -> cannot target same faction', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 7, influences: [Influences.Duke, Influences.Assassin] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
        { ...hailey, influences: [Influences.Captain, Influences.Duke] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.treasury = 0
        state.players[0].faction = Factions.Loyalist
        state.players[1].faction = Factions.Loyalist
        state.players[2].faction = Factions.Reformist
      })

      await expect(
        actionHandler({
          roomId,
          playerId: david.playerId,
          action: Actions.Coup,
          targetPlayer: harper.playerName,
        }),
      ).rejects.toThrow(CannotTargetSameFactionError)

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Coup,
        targetPlayer: hailey.playerName,
      })

      await loseInfluencesHandler({
        roomId,
        playerId: hailey.playerId,
        influences: [Influences.Captain],
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(0)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('faction targeting -> can target same faction when all same', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 7, influences: [Influences.Duke, Influences.Assassin] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.treasury = 0
        state.players[0].faction = Factions.Loyalist
        state.players[1].faction = Factions.Loyalist
      })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Coup,
        targetPlayer: harper.playerName,
      })

      await loseInfluencesHandler({
        roomId,
        playerId: harper.playerId,
        influences: [Influences.Ambassador],
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(0)
    })

    it('faction targeting -> can target same faction after all convert to same', async () => {
      const roomId = await setupTestGame([
        { ...harper, coins: 3, influences: [Influences.Ambassador, Influences.Contessa] },
        { ...david, coins: 7, influences: [Influences.Duke, Influences.Assassin] },
        { ...hailey, influences: [Influences.Captain, Influences.Duke] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.treasury = 0
        state.players[0].faction = Factions.Reformist
        state.players[1].faction = Factions.Loyalist
        state.players[2].faction = Factions.Loyalist
        state.turnPlayer = harper.playerName
      })

      // Harper converts to Loyalist -> now all are Loyalist, turn moves to David
      await actionHandler({
        roomId,
        playerId: harper.playerId,
        action: Actions.Convert,
        targetPlayer: harper.playerName,
      })

      // Now all same faction - David should be able to target Harper
      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Coup,
        targetPlayer: harper.playerName,
      })

      await loseInfluencesHandler({
        roomId,
        playerId: harper.playerId,
        influences: [Influences.Ambassador],
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players.every((p) => p.faction === Factions.Loyalist)).toBe(true)
      expect(gameState.players[1].coins).toBe(0)
    })

    it('block foreign aid -> disallowed for same faction', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Assassin] },
        { ...harper, influences: [Influences.Duke, Influences.Contessa] },
        { ...hailey, influences: [Influences.Ambassador, Influences.Duke] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.players[0].faction = Factions.Loyalist
        state.players[1].faction = Factions.Loyalist
        state.players[2].faction = Factions.Reformist
      })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.ForeignAid,
      })

      // Harper is same faction as David -> not in pendingPlayers -> cannot respond
      await expect(
        actionResponseHandler({
          roomId,
          playerId: harper.playerId,
          response: Responses.Block,
          claimedInfluence: Influences.Duke,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)

      // Hailey is opposing faction -> can block
      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Duke,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.pendingBlock).toBeDefined()
      expect(gameState.pendingBlock!.sourcePlayer).toBe(hailey.playerName)
    })

    it('embezzle -> inverse challenge fails -> both cards returned to deck and redrawn', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Assassin] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await mutateGameState(await getGameState(roomId), (state) => {
        state.settings.enableReformation = true
        state.treasury = 5
        state.players[0].faction = Factions.Loyalist
        state.players[1].faction = Factions.Reformist
      })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Embezzle,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      const gameState = await getGameState(roomId)

      // David does NOT have a Duke -> challenge fails -> both cards replaced
      expect(gameState.players[0].influences).toHaveLength(2)

      // Should have two PlayerReplacedInfluence log entries
      const replacedLogs = gameState.eventLogs.filter(
        (log) => log.event === EventMessages.PlayerReplacedInfluence && log.primaryPlayer === david.playerName,
      )
      expect(replacedLogs).toHaveLength(2)

      // Original cards should be back in the deck (minus any that were redrawn)
      const deckAndHand = [...gameState.deck, ...gameState.players[0].influences]
      expect(deckAndHand).toContain(Influences.Captain)
      expect(deckAndHand).toContain(Influences.Assassin)
    })

    it('examine -> force swap -> target gets new influence', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Inquisitor, Influences.Contessa] },
      ], { useInquisitor: true })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Examine,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      await revealForExamineHandler({
        roomId,
        playerId: harper.playerId,
        influence: Influences.Inquisitor,
      })

      await examineDecisionHandler({
        roomId,
        playerId: david.playerId,
        forceSwap: true,
      })

      const gameState = await getGameState(roomId)

      const swapLog = gameState.eventLogs.find(
        (log) => log.event === EventMessages.ExamineSwapped,
      )
      expect(swapLog).toBeDefined()
      expect(swapLog!.primaryPlayer).toBe(david.playerName)
      expect(swapLog!.secondaryPlayer).toBe(harper.playerName)
    })

    it('examine -> allow keep -> target retains influence', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Inquisitor, Influences.Contessa] },
      ], { useInquisitor: true })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Examine,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      await revealForExamineHandler({
        roomId,
        playerId: harper.playerId,
        influence: Influences.Contessa,
      })

      await examineDecisionHandler({
        roomId,
        playerId: david.playerId,
        forceSwap: false,
      })

      const gameState = await getGameState(roomId)

      const keptLog = gameState.eventLogs.find(
        (log) => log.event === EventMessages.ExamineKept,
      )
      expect(keptLog).toBeDefined()
      expect(keptLog!.primaryPlayer).toBe(david.playerName)
      expect(keptLog!.secondaryPlayer).toBe(harper.playerName)
    })

    it('block challenge -> blocker has influence -> block succeeds and challenger loses influence', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 3, influences: [Influences.Assassin, Influences.Duke] },
        { ...harper, influences: [Influences.Contessa, Influences.Captain] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Assassinate,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Contessa,
      })

      await blockResponseHandler({
        roomId,
        playerId: david.playerId,
        response: Responses.Challenge,
      })

      // Harper reveals Contessa -> challenge fails -> David loses influence
      await blockChallengeResponseHandler({
        roomId,
        playerId: harper.playerId,
        influence: Influences.Contessa,
      })

      let gameState = await getGameState(roomId)

      expect(gameState.pendingInfluenceLoss[david.playerName]).toHaveLength(1)
      expect(gameState.pendingBlock).toBeUndefined()
      expect(gameState.pendingAction).toBeUndefined()

      await loseInfluencesHandler({
        roomId,
        playerId: david.playerId,
        influences: [Influences.Duke],
      })

      gameState = await getGameState(roomId)

      expect(gameState.players[0].deadInfluences).toContain(Influences.Duke)
      expect(gameState.players[0].coins).toBe(0)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('block challenge -> blocker bluffing -> block fails and action proceeds', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 3, influences: [Influences.Assassin, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Captain] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Assassinate,
        targetPlayer: harper.playerName,
      })

      // Harper bluffs Contessa block
      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Contessa,
      })

      await blockResponseHandler({
        roomId,
        playerId: david.playerId,
        response: Responses.Challenge,
      })

      // Harper doesn't have Contessa -> reveals Ambassador -> challenge succeeds
      await blockChallengeResponseHandler({
        roomId,
        playerId: harper.playerId,
        influence: Influences.Ambassador,
      })

      const gameState = await getGameState(roomId)

      // Harper loses Ambassador from failed block challenge, then assassinate
      // kills remaining influence directly (auto-death when only 1 left)
      expect(gameState.players[1].influences).toHaveLength(0)
      expect(gameState.players[1].deadInfluences).toContain(Influences.Ambassador)
      expect(gameState.players[1].deadInfluences).toContain(Influences.Captain)
      expect(gameState.players[0].coins).toBe(0)
    })

    it('steal -> block -> pass -> block succeeds without challenge', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, coins: 2, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Steal,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Ambassador,
      })

      await blockResponseHandler({
        roomId,
        playerId: david.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.pendingBlock).toBeUndefined()
      expect(gameState.pendingAction).toBeUndefined()
      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.players[1].coins).toBe(2)
      expect(gameState.turnPlayer).toBe(harper.playerName)

      const blockLog = gameState.eventLogs.find(
        (log) => log.event === EventMessages.BlockSuccessful,
      )
      expect(blockLog).toBeDefined()
    })

    it('block response -> cannot block a block', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Steal,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Ambassador,
      })

      await expect(
        blockResponseHandler({
          roomId,
          playerId: david.playerId,
          response: Responses.Block,
        }),
      ).rejects.toThrow(BlockMayNotBeBlockedError)
    })

    it('forfeit -> replace with AI -> player becomes AI', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
        { ...hailey, influences: [Influences.Assassin, Influences.Duke] },
      ])

      await forfeitGameHandler({
        roomId,
        playerId: harper.playerId,
        replaceWithAi: true,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[1].ai).toBe(true)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[1].id).not.toBe(harper.playerId)

      const aiLog = gameState.eventLogs.find(
        (log) => log.event === EventMessages.PlayerReplacedWithAi,
      )
      expect(aiLog).toBeDefined()
    })

    it('forfeit -> kill influences -> player dies and turn advances', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
        { ...hailey, influences: [Influences.Assassin, Influences.Duke] },
      ])

      await forfeitGameHandler({
        roomId,
        playerId: harper.playerId,
        replaceWithAi: false,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[1].influences).toHaveLength(0)
      expect(gameState.players[1].deadInfluences).toContain(Influences.Ambassador)
      expect(gameState.players[1].deadInfluences).toContain(Influences.Contessa)
    })

    it('forfeit -> not allowed when player has pending action', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 3, influences: [Influences.Assassin, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Assassinate,
        targetPlayer: harper.playerName,
      })

      await expect(
        forfeitGameHandler({
          roomId,
          playerId: david.playerId,
          replaceWithAi: false,
        }),
      ).rejects.toThrow(UnableToForfeitError)
    })

    it('forfeit -> not allowed when game not started', async () => {
      const { roomId } = await createGameHandler({
        ...david,
        settings: { eventLogRetentionTurns: 100, allowRevive: true },
      })
      await joinGameHandler({ roomId, ...harper })

      await expect(
        forfeitGameHandler({
          roomId,
          playerId: david.playerId,
          replaceWithAi: false,
        }),
      ).rejects.toThrow(GameNotInProgressError)
    })

    it('speed round timer -> expired action throws error', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ], { speedRoundSeconds: 0.001 })

      // Wait just enough for the timer to expire
      await new Promise((resolve) => setTimeout(resolve, 10))

      await expect(
        actionHandler({
          roomId,
          playerId: david.playerId,
          action: Actions.Income,
        }),
      ).rejects.toThrow(SpeedRoundTimerExpiredError)
    })

    it('speed round timer -> forced move bypasses timer', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, coins: 2, influences: [Influences.Ambassador, Influences.Contessa] },
      ], { speedRoundSeconds: 0.001 })

      // Wait just enough for the timer to expire
      await new Promise((resolve) => setTimeout(resolve, 10))

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Income,
        isForcedMove: true,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.turnPlayer).toBe(harper.playerName)

      const forcedMoveLog = gameState.eventLogs.find(
        (log) => log.event === EventMessages.ForcedMoveProcessed,
      )
      expect(forcedMoveLog).toBeDefined()
    })

    it('action challenge -> bluff caught -> turn player loses influence and turn moves', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      // David claims Ambassador for exchange but doesn't have one
      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Exchange,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      // David must reveal — doesn't have Ambassador
      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Captain,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].deadInfluences).toContain(Influences.Captain)
      expect(gameState.pendingAction).toBeUndefined()
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('action challenge -> legitimate claim -> challenger loses influence and action proceeds', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 3, influences: [Influences.Assassin, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
        { ...hailey, influences: [Influences.Captain, Influences.Duke] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Assassinate,
        targetPlayer: hailey.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Challenge,
      })

      // David reveals Assassin -> challenge fails
      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Assassin,
      })

      let gameState = await getGameState(roomId)

      // Hailey must lose 1 influence for failed challenge, action still pending for her to respond
      expect(gameState.pendingInfluenceLoss[hailey.playerName]).toHaveLength(1)
      expect(gameState.pendingAction!.claimConfirmed).toBe(true)

      await loseInfluencesHandler({
        roomId,
        playerId: hailey.playerId,
        influences: [Influences.Captain],
      })

      // Hailey passes (cannot challenge again since claimConfirmed)
      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Pass,
      })

      gameState = await getGameState(roomId)

      // Assassination resolves — Hailey's last influence is auto-killed
      expect(gameState.players[2].influences).toHaveLength(0)
      expect(gameState.players[0].coins).toBe(0)
    })

    it('examine -> target player challenge fails and target dies -> examine skipped and turn advances', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Inquisitor, Influences.Duke] },
        { ...harper, influences: [Influences.Captain], deadInfluences: [Influences.Contessa] },
        { ...hailey, influences: [Influences.Assassin, Influences.Contessa] },
      ], { useInquisitor: true })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Examine,
        targetPlayer: harper.playerName,
      })

      // Harper (the target) challenges David's Inquisitor claim
      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      // David reveals Inquisitor -> challenge fails, Harper loses their only influence and dies
      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Inquisitor,
      })

      const gameState = await getGameState(roomId)

      // Harper is dead
      expect(gameState.players[1].influences).toHaveLength(0)
      expect(gameState.players[1].deadInfluences).toContain(Influences.Captain)

      // Examine should be skipped since target is dead
      expect(gameState.pendingExamine).toBeUndefined()

      // Turn should advance
      expect(gameState.turnPlayer).toBe(hailey.playerName)
    })

    it('examine -> failed challenge -> lose influence -> turn only advances once after examine decision', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Inquisitor, Influences.Duke] },
        { ...harper, influences: [Influences.Captain, Influences.Contessa] },
        { ...hailey, influences: [Influences.Assassin, Influences.Captain] },
      ], { useInquisitor: true, eventLogRetentionTurns: 3 })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Examine,
        targetPlayer: harper.playerName,
      })

      // Harper challenges David's Inquisitor claim
      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      // David reveals Inquisitor -> challenge fails
      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Inquisitor,
      })

      let gameState = await getGameState(roomId)
      const turnAfterChallenge = gameState.turn

      // Harper loses influence from failed challenge
      await loseInfluencesHandler({
        roomId,
        playerId: harper.playerId,
        influences: [Influences.Captain],
      })

      gameState = await getGameState(roomId)

      // Turn should NOT have advanced yet — pendingExamine is active
      expect(gameState.turn).toBe(turnAfterChallenge)
      expect(gameState.pendingExamine).toBeDefined()

      // Harper reveals for examine
      await revealForExamineHandler({
        roomId,
        playerId: harper.playerId,
        influence: Influences.Contessa,
      })

      // David decides to keep
      await examineDecisionHandler({
        roomId,
        playerId: david.playerId,
        forceSwap: false,
      })

      gameState = await getGameState(roomId)

      // Turn advances exactly once
      expect(gameState.turn).toBe(turnAfterChallenge + 1)
      expect(gameState.turnPlayer).toBe(harper.playerName)

      // Event logs should still be present (not pruned by double turn increment)
      expect(gameState.eventLogs.length).toBeGreaterThan(0)
      const examineLog = gameState.eventLogs.find(
        (log) => log.event === EventMessages.ExamineKept,
      )
      expect(examineLog).toBeDefined()
    })

    it('multiple players passing in sequence -> action resolves', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
        { ...hailey, influences: [Influences.Assassin, Influences.Duke] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Tax,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.pendingAction).toBeUndefined()
      expect(gameState.players[0].coins).toBe(5)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('foreign aid -> one player blocks -> other passes do not matter', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Assassin] },
        { ...harper, influences: [Influences.Duke, Influences.Contessa] },
        { ...hailey, influences: [Influences.Ambassador, Influences.Duke] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.ForeignAid,
      })

      // Harper blocks first
      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Duke,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.pendingBlock).toBeDefined()
      expect(gameState.pendingBlock!.sourcePlayer).toBe(harper.playerName)

      // Hailey can no longer respond since block is pending
      await expect(
        actionResponseHandler({
          roomId,
          playerId: hailey.playerId,
          response: Responses.Pass,
        }),
      ).rejects.toThrow(ActionNotCurrentlyAllowedError)
    })

    it('challenge not allowed on unchallengeable action', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.ForeignAid,
      })

      await expect(
        actionResponseHandler({
          roomId,
          playerId: harper.playerId,
          response: Responses.Challenge,
        }),
      ).rejects.toThrow(ActionNotChallengeableError)
    })

    it('claim confirmed -> cannot challenge again', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
        { ...hailey, influences: [Influences.Assassin, Influences.Duke] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Steal,
        targetPlayer: harper.playerName,
      })

      // Hailey challenges David's claim of Captain
      await actionResponseHandler({
        roomId,
        playerId: hailey.playerId,
        response: Responses.Challenge,
      })

      // David proves he has Captain
      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Captain,
      })

      await loseInfluencesHandler({
        roomId,
        playerId: hailey.playerId,
        influences: [Influences.Assassin],
      })

      let gameState = await getGameState(roomId)

      // Claim is now confirmed, Harper (target) should not be able to challenge
      expect(gameState.pendingAction!.claimConfirmed).toBe(true)

      await expect(
        actionResponseHandler({
          roomId,
          playerId: harper.playerId,
          response: Responses.Challenge,
        }),
      ).rejects.toThrow(ClaimedInfluenceAlreadyConfirmedError)

      // But Harper can still block
      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Block,
        claimedInfluence: Influences.Ambassador,
      })

      gameState = await getGameState(roomId)

      expect(gameState.pendingBlock).toBeDefined()
      expect(gameState.pendingBlock!.sourcePlayer).toBe(harper.playerName)
    })

    it('forfeit as last pending responder -> action resolves', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Tax,
      })

      // Harper is the only pending responder — forfeit kills them and resolves action
      await forfeitGameHandler({
        roomId,
        playerId: harper.playerId,
        replaceWithAi: false,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[1].influences).toHaveLength(0)
      // Tax should have resolved
      expect(gameState.players[0].coins).toBe(5)
      expect(gameState.pendingAction).toBeUndefined()
    })

    it('convert self -> costs 1 coin and toggles own faction', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 3, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ], { enableReformation: true })

      const gameStateBefore = await getGameState(roomId)
      const davidFactionBefore = gameStateBefore.players[0].faction

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Convert,
        targetPlayer: david.playerName,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.players[0].faction).not.toBe(davidFactionBefore)
      expect(gameState.treasury).toBe(1)
    })

    it('convert other player -> costs 2 coins and toggles target faction', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 3, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ], { enableReformation: true })

      const gameStateBefore = await getGameState(roomId)
      const harperFactionBefore = gameStateBefore.players[1].faction

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Convert,
        targetPlayer: harper.playerName,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(1)
      expect(gameState.players[1].faction).not.toBe(harperFactionBefore)
      expect(gameState.treasury).toBe(2)
    })

    it('convert self explicitly by passing own name -> costs 1 coin (same as no target)', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 3, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ], { enableReformation: true })

      const gameStateBefore = await getGameState(roomId)
      const davidFactionBefore = gameStateBefore.players[0].faction

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Convert,
        targetPlayer: david.playerName,
      })

      const gameState = await getGameState(roomId)

      // Self-convert always costs 1 coin regardless of whether name is passed
      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.players[0].faction).not.toBe(davidFactionBefore)
      expect(gameState.treasury).toBe(1)
    })

    it('steal target with 0 coins -> steal resolves but no coins transferred', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, coins: 0, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Steal,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.players[1].coins).toBe(0)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('steal target with 1 coin -> only 1 coin transferred', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, coins: 1, influences: [Influences.Ambassador, Influences.Contessa] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Steal,
        targetPlayer: harper.playerName,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(0)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('exchange with inquisitor -> draws 1 card (not 2)', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Inquisitor, Influences.Duke] },
        { ...harper, influences: [Influences.Captain, Influences.Contessa] },
      ], { useInquisitor: true })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Exchange,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)

      // With Inquisitor, exchange draws 1 card → player has 3, must put back 1
      expect(gameState.players[0].influences).toHaveLength(3)
      expect(gameState.pendingInfluenceLoss[david.playerName]).toHaveLength(1)
      expect(gameState.pendingInfluenceLoss[david.playerName][0].putBackInDeck).toBe(true)
    })

    it('exchange without inquisitor -> draws 2 cards', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Ambassador, Influences.Duke] },
        { ...harper, influences: [Influences.Captain, Influences.Contessa] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Exchange,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)

      // Without Inquisitor, exchange draws 2 cards → player has 4, must put back 2
      expect(gameState.players[0].influences).toHaveLength(4)
      expect(gameState.pendingInfluenceLoss[david.playerName]).toHaveLength(2)
      expect(gameState.pendingInfluenceLoss[david.playerName][0].putBackInDeck).toBe(true)
      expect(gameState.pendingInfluenceLoss[david.playerName][1].putBackInDeck).toBe(true)
    })

    it('exchange -> lose influence puts card back in deck (not dead)', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Ambassador, Influences.Duke] },
        { ...harper, influences: [Influences.Captain, Influences.Contessa] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Exchange,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)
      const deckSizeBefore = gameState.deck.length

      await loseInfluencesHandler({
        roomId,
        playerId: david.playerId,
        influences: gameState.players[0].influences.slice(0, 2),
      })

      const finalState = await getGameState(roomId)

      // Influences put back in deck, not in deadInfluences
      expect(finalState.players[0].influences).toHaveLength(2)
      expect(finalState.players[0].deadInfluences).toHaveLength(0)
      expect(finalState.deck.length).toBe(deckSizeBefore + 2)
      expect(finalState.turnPlayer).toBe(harper.playerName)
    })

    it('embezzle with 0 treasury -> action resolves but no coins gained', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [Influences.Ambassador, Influences.Contessa] },
      ], { enableReformation: true })

      // Ensure treasury is 0
      const preState = await getGameState(roomId)
      expect(preState.treasury).toBe(0)

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Embezzle,
      })

      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Pass,
      })

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.treasury).toBe(0)
      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('turn advancement skips multiple consecutive dead players', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Duke, Influences.Captain] },
        { ...harper, influences: [], deadInfluences: [Influences.Ambassador, Influences.Contessa] },
        { ...hailey, influences: [], deadInfluences: [Influences.Assassin, Influences.Duke] },
        { ...marissa, influences: [Influences.Captain, Influences.Contessa] },
      ])

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Income,
      })

      const gameState = await getGameState(roomId)

      // Turn should skip dead Harper and dead Hailey, go to Marissa
      expect(gameState.turnPlayer).toBe(marissa.playerName)
    })

    it('challenge kills player causing all same faction -> pending players still resolves', async () => {
      const roomId = await setupTestGame([
        { ...david, coins: 2, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Ambassador], deadInfluences: [Influences.Contessa] },
        { ...hailey, influences: [Influences.Assassin, Influences.Contessa] },
      ], { enableReformation: true })

      // Set factions: David=Reformist, Harper=Loyalist, Hailey=Reformist
      await mutateGameState(await getGameState(roomId), (state) => {
        state.players[0].faction = Factions.Reformist
        state.players[1].faction = Factions.Loyalist
        state.players[2].faction = Factions.Reformist
      })

      await actionHandler({
        roomId,
        playerId: david.playerId,
        action: Actions.Steal,
        targetPlayer: harper.playerName,
      })

      // Harper challenges David's Captain claim
      await actionResponseHandler({
        roomId,
        playerId: harper.playerId,
        response: Responses.Challenge,
      })

      // David reveals Captain → challenge fails → Harper dies (only 1 influence)
      await actionChallengeResponseHandler({
        roomId,
        playerId: david.playerId,
        influence: Influences.Captain,
      })

      const gameState = await getGameState(roomId)

      // Harper is dead, all remaining players are Reformist (same faction)
      expect(gameState.players[1].influences).toHaveLength(0)
      // Steal should process since target is dead but action still resolves
      expect(gameState.pendingAction).toBeUndefined()
      expect(gameState.turnPlayer).toBe(hailey.playerName)
    })
  })
})
