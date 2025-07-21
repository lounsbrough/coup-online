import { Chance } from "chance"
import { drawCardFromDeck, getCountOfEachInfluence, getGameState, getPublicGameState, logEvent, mutateGameState, validateGameState } from "./gameState"
import { Actions, EventMessages, GameState, Influences, Player, PublicGameState } from '../../../shared/types/game'
import { getValue, setValue } from "./storage"
import { shuffle } from "./array"
import { compressString, decompressString } from "./compression"
import { getCurrentTimestamp } from "./time"
import { dehydrateGameState } from "../../../shared/helpers/state"
import { MAX_PLAYER_COUNT } from "../../../shared/helpers/playerCount"

jest.mock("./storage")
jest.mock("./compression")
jest.mock("./time")
const getValueMock = jest.mocked(getValue)
const setValueMock = jest.mocked(setValue)
const compressStringMock = jest.mocked(compressString)
const decompressStringMock = jest.mocked(decompressString)
const getCurrentTimestampMock = jest.mocked(getCurrentTimestamp)

const chance = new Chance()

const getRandomPlayers = (state: GameState, count: number): Player[] =>
  chance.n(() => ({
    id: chance.string(),
    name: chance.string(),
    color: chance.color(),
    coins: 2,
    influences: [...Array.from({ length: 2 }, () => drawCardFromDeck(state))],
    claimedInfluences: new Set(),
    unclaimedInfluences: new Set(),
    deadInfluences: [],
    ai: false,
    grudges: {}
  }), count)

const getRandomGameState = ({ playersCount }: { playersCount?: number } = {}) => {
  const playerCount = playersCount ?? chance.natural({ min: 2, max: MAX_PLAYER_COUNT })

  const gameState: GameState = {
    deck: shuffle(Object.values(Influences)
      .flatMap((influence) => Array.from({ length: getCountOfEachInfluence(playerCount) }, () => influence))),
    eventLogs: [],
    chatMessages: [],
    lastEventTimestamp: chance.date(),
    isStarted: chance.bool(),
    availablePlayerColors: chance.n(chance.color, MAX_PLAYER_COUNT),
    players: [],
    pendingInfluenceLoss: {},
    roomId: chance.string(),
    turn: chance.natural(),
    settings: { eventLogRetentionTurns: 100, allowRevive: true }
  }

  gameState.players = getRandomPlayers(gameState, playerCount)
  gameState.turnPlayer = chance.pickone(gameState.players).name

  return gameState
}

describe('gameState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    compressStringMock.mockImplementation((string) => string)
    decompressStringMock.mockImplementation((string) => string)
  })

  describe('getGameState', () => {
    it('should get game state object from storage by room id key', async () => {
      const roomId = 'some room'
      const gameState = getRandomGameState()
      const compressedStateString = 'some compressed base64'
      getValueMock.mockResolvedValue(compressedStateString)
      decompressStringMock.mockReturnValue(JSON.stringify(dehydrateGameState(gameState)))

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
        deckCount: 5 * getCountOfEachInfluence(gameState.players.length) - gameState.players.length * 2,
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
          grudges: selfPlayer.grudges
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
          grudges: player.grudges
        })),
        settings: gameState.settings,
        ...(gameState.pendingAction && { pendingAction: gameState.pendingAction }),
        ...(gameState.pendingActionChallenge && { pendingActionChallenge: gameState.pendingActionChallenge }),
        ...(gameState.pendingBlock && { pendingBlock: gameState.pendingBlock }),
        ...(gameState.pendingBlockChallenge && { pendingBlockChallenge: gameState.pendingBlockChallenge }),
        ...(gameState.turnPlayer && { turnPlayer: gameState.turnPlayer })
      }

      expect(getPublicGameState({ gameState, playerId: selfPlayer.id }))
        .toStrictEqual(publicGameState)
    })
  })

  describe('mutateGameState', () => {
    it('should validate state before updating storage', async () => {
      const gameState = getRandomGameState()
      getValueMock.mockResolvedValue(JSON.stringify(gameState))

      await expect(mutateGameState(gameState, (state) => {
        state.players[0].influences = []
        state.turnPlayer = state.players[0].name
      })).rejects.toThrow()

      expect(setValueMock).not.toHaveBeenCalled()
    })

    it('should update storage with new state', async () => {
      const gameState = getRandomGameState()
      const compressedStateString = 'some compressed base64'
      getValueMock.mockResolvedValue(JSON.stringify(dehydrateGameState(gameState)))
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
      expect(setValueMock).toHaveBeenCalledWith(gameState.roomId.toUpperCase(), compressedStateString, oneMonth)
    })

    it('should not update storage if state unchanged', async () => {
      const gameState = getRandomGameState()
      const compressedStateString = 'some compressed base64'
      getValueMock.mockResolvedValue(JSON.stringify(dehydrateGameState(gameState)))
      compressStringMock.mockReturnValue(compressedStateString)

      await mutateGameState(gameState, (state) => {
        state.players[0] = {...state.players[0]}
      })

      expect(compressStringMock).not.toHaveBeenCalled()
      expect(setValueMock).not.toHaveBeenCalled()
    })
  })

  describe('validateGameState', () => {
    it.each([
      { mutation: () => { } },
      {
        mutation: (state: GameState) => {
          state.players[0].influences.push(...[drawCardFromDeck(state), drawCardFromDeck(state)])
          state.pendingInfluenceLoss[state.players[0].name] = [{ putBackInDeck: true }, { putBackInDeck: true }]
        }
      },
      {
        mutation: (state: GameState) => {
          const killedInfluence = state.players[0].influences.splice(0, 1)[0]
          state.players[0].deadInfluences.push(killedInfluence)
        }
      }
    ])('should not throw if game state is valid', ({ mutation }) => {
      const gameState = getRandomGameState()
      mutation(gameState)
      expect(() => validateGameState(dehydrateGameState(gameState))).not.toThrow()
    })

    it.each([
      {
        mutation: (state: GameState) => { state.players.length = 0 },
        error: `Game state must always have 1 to ${MAX_PLAYER_COUNT} players`
      },
      {
        mutation: (state: GameState) => {
          const playerCount = MAX_PLAYER_COUNT + 1
          state.deck = shuffle(Object.values(Influences)
            .flatMap((influence) => Array.from({ length: 5 }, () => influence)))
          state.players = getRandomPlayers(state, playerCount)
        },
        error: `Game state must always have 1 to ${MAX_PLAYER_COUNT} players`
      },
      {
        mutation: (state: GameState) => {
          state.isStarted = true
          state.players[0].influences.push(...[drawCardFromDeck(state), drawCardFromDeck(state)])
          state.pendingInfluenceLoss[state.players[0].name] = [{ putBackInDeck: true }]
        },
        error: "Players must have exactly 2 influences"
      },
      {
        mutation: (state: GameState) => { state.deck.splice(0, 1) },
        error: "Incorrect total card count in game"
      },
      {
        mutation: (state: GameState) => {
          state.pendingAction = {
            action: chance.pickone(Object.values(Actions)),
            pendingPlayers: new Set(),
            claimConfirmed: false
          }
        },
        error: "Everyone has passed but the action is still pending"
      },
      {
        mutation: (state: GameState) => {
          state.pendingBlock = {
            pendingPlayers: new Set(),
            sourcePlayer: chance.pickone(state.players).name,
            claimedInfluence: chance.pickone(Object.values(Influences))
          }
        },
        error: "Everyone has passed but the block is still pending"
      }
    ])('should throw $error', async ({ mutation, error }) => {
      const gameState = getRandomGameState()
      mutation(gameState)
      expect(() => validateGameState(dehydrateGameState(gameState))).toThrow(error)
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
    const gameState = {
      ...getRandomGameState(),
      settings: { eventLogRetentionTurns: 50, allowRevive: true }
    }

    const newLog = {
      event: chance.pickone(Object.values(EventMessages)),
      turn: gameState.turn
    }

    let expectedEventLogs = [...gameState.eventLogs, newLog]
    logEvent(gameState, newLog)
    expect(gameState.eventLogs).toEqual(expectedEventLogs)

    gameState.eventLogs = chance.n(() => ({
      event: chance.pickone(Object.values(EventMessages)),
      turn: chance.natural({max: 100, min: 1})
    }), 100)

    expectedEventLogs = [...gameState.eventLogs.filter(({ turn }) =>
      gameState.turn - turn < gameState.settings.eventLogRetentionTurns
    ), newLog]
    logEvent(gameState, newLog)
    expect(gameState.eventLogs.length).toBeLessThan(99)
    expect(gameState.eventLogs).toEqual(expectedEventLogs)
    expect(gameState.eventLogs.at(-1)?.turn).toBe(gameState.turn)
  })

  describe('getCountOfEachInfluence', () => {
    it('should return correct count for given player count', () => {
      expect(getCountOfEachInfluence(0)).toBe(3)
      expect(getCountOfEachInfluence(1)).toBe(3)
      expect(getCountOfEachInfluence(2)).toBe(3)
      expect(getCountOfEachInfluence(3)).toBe(3)
      expect(getCountOfEachInfluence(4)).toBe(3)
      expect(getCountOfEachInfluence(5)).toBe(3)
      expect(getCountOfEachInfluence(6)).toBe(3)
      expect(getCountOfEachInfluence(7)).toBe(4)
      expect(getCountOfEachInfluence(8)).toBe(4)
      expect(getCountOfEachInfluence(9)).toBe(5)
      expect(getCountOfEachInfluence(10)).toBe(5)
    })

    it('should throw error for invalid player count', () => {
      expect(() => getCountOfEachInfluence(-1)).toThrow("Invalid player count: -1")
      expect(() => getCountOfEachInfluence(11)).toThrow("Invalid player count: 11")
    })
  })
})
