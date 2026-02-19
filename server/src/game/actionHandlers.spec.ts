import { vi, type MockInstance } from 'vitest'
import Chance from 'chance'
import { Actions, Influences, Responses } from '../../../shared/types/game'
import {
  actionChallengeResponseHandler,
  actionHandler,
  actionResponseHandler,
  blockChallengeResponseHandler,
  blockResponseHandler,
  createGameHandler,
  joinGameHandler,
  loseInfluencesHandler,
  removeFromGameHandler,
  resetGameHandler,
  resetGameRequestCancelHandler,
  resetGameRequestHandler,
  startGameHandler,
} from './actionHandlers'
import { getValue, setValue } from '../utilities/storage'
import { getGameState, mutateGameState } from '../utilities/gameState'
import * as identifiers from '../utilities/identifiers'
import {
  ActionNotChallengeableError,
  ActionNotCurrentlyAllowedError,
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
  TargetPlayerIsSelfError,
  TargetPlayerRequiredForActionError,
} from '../utilities/errors'

vi.mock('../utilities/storage')

const getValueMock = vi.mocked(getValue)
const setValueMock = vi.mocked(setValue)

const inMemoryStorage: {
  [key: string]: string;
} = {}

getValueMock.mockImplementation(async (key: string) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.floor(Math.random() * 10))
  })
  return inMemoryStorage[key]
})

setValueMock.mockImplementation(async (key: string, value: string) => {
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
    ) => {
      const { roomId } = await createGameHandler({
        ...players[0],
        settings: { eventLogRetentionTurns: 100, allowRevive: true },
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
  })
})
