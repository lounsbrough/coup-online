import { vi } from 'vitest'
import { Chance } from 'chance'
import {
  drawCardFromDeck,
  getGameState,
  getPublicGameState,
  logEvent,
  mutateGameState,
  validateGameState,
} from './gameState'
import { getCountOfEachInfluence, createDeckForPlayerCount } from './deck'
import {
  Actions,
  EventMessages,
  GameState,
  Influences,
  Player,
  PublicGameState,
} from '../../../shared/types/game'
import { getValue, setValue } from './storage'
import { compressString, decompressString } from './compression'
import { getCurrentTimestamp } from './time'
import { dehydrateGameState } from '../../../shared/helpers/state'
import { MAX_PLAYER_COUNT } from '../../../shared/helpers/playerCount'
import {
  EveryonePassedWithPendingDecisionError,
  IncorrectTotalCardCountError,
  InvalidPlayerCountError,
  PlayersMustHave2InfluencesError,
} from './errors'

vi.mock('./storage')
vi.mock('./compression')
vi.mock('./time')
const getValueMock = vi.mocked(getValue)
const setValueMock = vi.mocked(setValue)
const compressStringMock = vi.mocked(compressString)
const decompressStringMock = vi.mocked(decompressString)
const getCurrentTimestampMock = vi.mocked(getCurrentTimestamp)

const chance = new Chance()

const getRandomPlayers = (state: GameState, count: number): Player[] =>
  chance.n(
    () => ({
      id: chance.string(),
      name: chance.string(),
      color: chance.color(),
      coins: 2,
      influences: [...Array.from({ length: 2 }, () => drawCardFromDeck(state))],
      claimedInfluences: new Set(),
      unclaimedInfluences: new Set(),
      deadInfluences: [],
      ai: false,
      grudges: {},
    }),
    count,
  )

const getRandomGameState = ({
  playersCount,
}: { playersCount?: number } = {}) => {
  const playerCount =
    playersCount ?? chance.natural({ min: 2, max: MAX_PLAYER_COUNT })

  const gameState: GameState = {
    deck: createDeckForPlayerCount(playerCount),
    eventLogs: [],
    chatMessages: [],
    lastEventTimestamp: chance.date(),
    isStarted: chance.bool(),
    availablePlayerColors: chance.n(chance.color, MAX_PLAYER_COUNT),
    players: [],
    pendingInfluenceLoss: {},
    roomId: chance.string(),
    turn: chance.natural(),
    settings: { eventLogRetentionTurns: 100, allowRevive: true },
  }

  gameState.players = getRandomPlayers(gameState, playerCount)
  gameState.turnPlayer = chance.pickone(gameState.players).name

  return gameState
}

describe('gameState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    compressStringMock.mockImplementation((string) => string)
    decompressStringMock.mockImplementation((string) => string)
  })

  describe('getGameState', () => {
    it('should get game state object from storage by room id key', async () => {
      const roomId = 'some room'
      const gameState = getRandomGameState()
      const compressedStateString = 'some compressed base64'
      getValueMock.mockResolvedValue(compressedStateString)
      decompressStringMock.mockReturnValue(
        JSON.stringify(dehydrateGameState(gameState)),
      )

      expect(await getGameState(roomId)).toEqual(gameState)
      expect(decompressStringMock).toHaveBeenCalledTimes(1)
      expect(decompressStringMock).toHaveBeenCalledWith(compressedStateString)
      expect(getValueMock).toHaveBeenCalledTimes(1)
      expect(getValueMock).toHaveBeenCalledWith(roomId.toUpperCase())
    })
  })

  describe('getPublicGameState', () => {
    it('should get portion of game state that is accessible to player', () => {
      const gameState = getRandomGameState()
      const selfPlayer = chance.pickone(gameState.players)

      const publicGameState: PublicGameState = {
        eventLogs: gameState.eventLogs,
        chatMessages: gameState.chatMessages,
        lastEventTimestamp: gameState.lastEventTimestamp,
        isStarted: gameState.isStarted,
        turn: gameState.turn,
        pendingInfluenceLoss: gameState.pendingInfluenceLoss,
        roomId: gameState.roomId,
        deckCount:
          5 * getCountOfEachInfluence(gameState.players.length) -
          gameState.players.length * 2,
        selfPlayer: {
          id: selfPlayer.id,
          name: selfPlayer.name,
          color: selfPlayer.color,
          coins: selfPlayer.coins,
          influences: selfPlayer.influences,
          claimedInfluences: selfPlayer.claimedInfluences,
          unclaimedInfluences: selfPlayer.unclaimedInfluences,
          deadInfluences: selfPlayer.deadInfluences,
          ai: selfPlayer.ai,
          grudges: selfPlayer.grudges,
        },
        players: gameState.players.map((player) => ({
          name: player.name,
          color: player.color,
          coins: player.coins,
          influenceCount: player.influences.length,
          claimedInfluences: player.claimedInfluences,
          unclaimedInfluences: player.unclaimedInfluences,
          deadInfluences: player.deadInfluences,
          ai: player.ai,
          grudges: player.grudges,
        })),
        settings: gameState.settings,
        ...(gameState.pendingAction && {
          pendingAction: gameState.pendingAction,
        }),
        ...(gameState.pendingActionChallenge && {
          pendingActionChallenge: gameState.pendingActionChallenge,
        }),
        ...(gameState.pendingBlock && { pendingBlock: gameState.pendingBlock }),
        ...(gameState.pendingBlockChallenge && {
          pendingBlockChallenge: gameState.pendingBlockChallenge,
        }),
        ...(gameState.turnPlayer && { turnPlayer: gameState.turnPlayer }),
      }

      expect(
        getPublicGameState({ gameState, playerId: selfPlayer.id }),
      ).toStrictEqual(publicGameState)
    })
  })

  describe('mutateGameState', () => {
    it('should validate state before updating storage', async () => {
      const gameState = getRandomGameState()
      getValueMock.mockResolvedValue(JSON.stringify(gameState))

      await expect(
        mutateGameState(gameState, (state) => {
          state.players[0].influences = []
          state.turnPlayer = state.players[0].name
        }),
      ).rejects.toThrow()

      expect(setValueMock).not.toHaveBeenCalled()
    })

    it('should update storage with new state', async () => {
      const gameState = getRandomGameState()
      const compressedStateString = 'some compressed base64'
      getValueMock.mockResolvedValue(
        JSON.stringify(dehydrateGameState(gameState)),
      )
      compressStringMock.mockReturnValue(compressedStateString)

      getCurrentTimestampMock.mockReturnValue(new Date(1, 22, 2020))

      await mutateGameState(gameState, (state) => {
        state.players[0].coins -= 1
      })

      const expectedState = dehydrateGameState(gameState)
      expectedState.players[0].coins -= 1
      expectedState.lastEventTimestamp = new Date(1, 22, 2020).toISOString()

      const actualStateString = compressStringMock.mock.calls[0][0]

      expect(compressStringMock).toHaveBeenCalledTimes(1)
      expect(JSON.parse(actualStateString)).toEqual(expectedState)
      expect(setValueMock).toHaveBeenCalledTimes(1)
      const oneMonth = 2678400
      expect(setValueMock).toHaveBeenCalledWith(
        gameState.roomId.toUpperCase(),
        compressedStateString,
        oneMonth,
      )
    })

    it('should not update storage if state unchanged', async () => {
      const gameState = getRandomGameState()
      const compressedStateString = 'some compressed base64'
      getValueMock.mockResolvedValue(
        JSON.stringify(dehydrateGameState(gameState)),
      )
      compressStringMock.mockReturnValue(compressedStateString)

      await mutateGameState(gameState, (state) => {
        state.players[0] = { ...state.players[0] }
      })

      expect(compressStringMock).not.toHaveBeenCalled()
      expect(setValueMock).not.toHaveBeenCalled()
    })
  })

  describe('validateGameState', () => {
    it.each([
      { mutation: () => {} },
      {
        mutation: (state: GameState) => {
          state.players[0].influences.push(
            ...[drawCardFromDeck(state), drawCardFromDeck(state)],
          )
          state.pendingInfluenceLoss[state.players[0].name] = [
            { putBackInDeck: true },
            { putBackInDeck: true },
          ]
        },
      },
      {
        mutation: (state: GameState) => {
          const killedInfluence = state.players[0].influences.splice(0, 1)[0]
          state.players[0].deadInfluences.push(killedInfluence)
        },
      },
    ])('should not throw if game state is valid', ({ mutation }) => {
      const gameState = getRandomGameState()
      mutation(gameState)
      expect(() =>
        validateGameState(dehydrateGameState(gameState)),
      ).not.toThrow()
    })

    it.each([
      {
        mutation: (state: GameState) => {
          state.players.length = 0
        },
        error: InvalidPlayerCountError,
      },
      {
        mutation: (state: GameState) => {
          const playerCount = MAX_PLAYER_COUNT + 1
          state.deck = createDeckForPlayerCount(MAX_PLAYER_COUNT)
          state.players = getRandomPlayers(state, playerCount)
        },
        error: InvalidPlayerCountError,
      },
      {
        mutation: (state: GameState) => {
          state.isStarted = true
          state.players[0].influences.push(
            ...[drawCardFromDeck(state), drawCardFromDeck(state)],
          )
          state.pendingInfluenceLoss[state.players[0].name] = [
            { putBackInDeck: true },
          ]
        },
        error: PlayersMustHave2InfluencesError,
      },
      {
        mutation: (state: GameState) => {
          state.deck.splice(0, 1)
        },
        error: IncorrectTotalCardCountError,
      },
      {
        mutation: (state: GameState) => {
          state.pendingAction = {
            action: chance.pickone(Object.values(Actions)),
            pendingPlayers: new Set(),
            claimConfirmed: false,
          }
        },
        error: EveryonePassedWithPendingDecisionError,
      },
      {
        mutation: (state: GameState) => {
          state.pendingBlock = {
            pendingPlayers: new Set(),
            sourcePlayer: chance.pickone(state.players).name,
            claimedInfluence: chance.pickone(Object.values(Influences)),
          }
        },
        error: EveryonePassedWithPendingDecisionError,
      },
    ])('should throw $error', async ({ mutation, error }) => {
      const gameState = getRandomGameState()
      mutation(gameState)
      expect(() => validateGameState(dehydrateGameState(gameState))).toThrow(
        error,
      )
    })
  })

  describe('drawCardFromDeck', () => {
    it('should return top card and remove it from deck', () => {
      const gameState = getRandomGameState()

      const expectedCard = gameState.deck.at(-1)
      const expectedDeckSize = gameState.deck.length - 1

      expect(drawCardFromDeck(gameState)).toBe(expectedCard)
      expect(gameState.deck.length).toBe(expectedDeckSize)
    })
  })

  describe('logEvent', () => {
    it('should add event log and trim old logs beyond retention', () => {
      const gameState = {
        ...getRandomGameState(),
        settings: { eventLogRetentionTurns: 50, allowRevive: true },
      }

      const newLog = {
        event: chance.pickone(Object.values(EventMessages)),
        turn: gameState.turn,
      }

      let expectedEventLogs = [...gameState.eventLogs, newLog]
      logEvent(gameState, newLog)
      expect(gameState.eventLogs).toEqual(expectedEventLogs)

      gameState.eventLogs = chance.n(
        () => ({
          event: chance.pickone(Object.values(EventMessages)),
          turn: chance.natural({ max: 100, min: 1 }),
        }),
        100,
      )

      expectedEventLogs = [
        ...gameState.eventLogs.filter(
          ({ turn }) =>
            gameState.turn - turn < gameState.settings.eventLogRetentionTurns,
        ),
        newLog,
      ]
      logEvent(gameState, newLog)
      expect(gameState.eventLogs.length).toBeLessThan(99)
      expect(gameState.eventLogs).toEqual(expectedEventLogs)
      expect(gameState.eventLogs.at(-1)?.turn).toBe(gameState.turn)
    })
  })
})
