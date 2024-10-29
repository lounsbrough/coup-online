import { Chance } from "chance"
import { drawCardFromDeck, getGameState, getPublicGameState, mutateGameState, validateGameState } from "./gameState"
import { Actions, GameState, Influences, PublicGameState } from '../../../shared/types/game'
import { getValue, setValue } from "./storage"
import { shuffle } from "./array"
import { compressString, decompressString } from "./compression"

jest.mock("./storage")
jest.mock("./compression")
const getValueMock = jest.mocked(getValue)
const setValueMock = jest.mocked(setValue)
const compressStringMock = jest.mocked(compressString)
const decompressStringMock = jest.mocked(decompressString)

const chance = new Chance()
const oneDay = 86400

const getRandomPlayers = (state: GameState, count?: number) =>
  chance.n(() => ({
    id: chance.string(),
    name: chance.string(),
    color: chance.color(),
    coins: 2,
    influences: [...Array.from({ length: 2 }, () => drawCardFromDeck(state))],
    deadInfluences: [],
    ai: false
  }), count ?? chance.natural({ min: 2, max: 6 }))

const getRandomGameState = ({ playersCount }: { playersCount?: number } = {}) => {
  const gameState: GameState = {
    deck: shuffle(Object.values(Influences)
      .flatMap((influence) => Array.from({ length: 3 }, () => influence))),
    eventLogs: chance.n(chance.string, chance.natural({ min: 2, max: 10 })),
    isStarted: chance.bool(),
    availablePlayerColors: chance.n(chance.color, 6),
    players: [],
    pendingInfluenceLoss: {},
    roomId: chance.string()
  }

  gameState.players = getRandomPlayers(gameState, playersCount)
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
      decompressStringMock.mockReturnValue(JSON.stringify(gameState))

      expect(await getGameState(roomId)).toEqual(gameState)
      expect(decompressString).toHaveBeenCalledTimes(1)
      expect(decompressString).toHaveBeenCalledWith(compressedStateString)
      expect(getValueMock).toHaveBeenCalledTimes(1)
      expect(getValueMock).toHaveBeenCalledWith(roomId.toUpperCase())
    })
  })

  describe('getPublicGameState', () => {
    it('should get portion of game state that is accessible to player', async () => {
      const gameState = getRandomGameState()
      const selfPlayer = chance.pickone(gameState.players)
      getValueMock.mockResolvedValue(JSON.stringify(gameState))

      const publicGameState: PublicGameState = {
        eventLogs: gameState.eventLogs,
        isStarted: gameState.isStarted,
        pendingInfluenceLoss: gameState.pendingInfluenceLoss,
        roomId: gameState.roomId,
        deckCount: 15 - gameState.players.length * 2,
        selfPlayer: {
          id: selfPlayer.id,
          name: selfPlayer.name,
          color: selfPlayer.color,
          coins: selfPlayer.coins,
          influences: selfPlayer.influences,
          deadInfluences: selfPlayer.deadInfluences,
          ai: selfPlayer.ai
        },
        players: gameState.players.map((player) => ({
          name: player.name,
          color: player.color,
          coins: player.coins,
          influenceCount: player.influences.length,
          deadInfluences: player.deadInfluences,
          ai: player.ai
        })),
        ...(gameState.pendingAction && { pendingAction: gameState.pendingAction }),
        ...(gameState.pendingActionChallenge && { pendingActionChallenge: gameState.pendingActionChallenge }),
        ...(gameState.pendingBlock && { pendingBlock: gameState.pendingBlock }),
        ...(gameState.pendingBlockChallenge && { pendingBlockChallenge: gameState.pendingBlockChallenge }),
        ...(gameState.turnPlayer && { turnPlayer: gameState.turnPlayer })
      }

      expect(await getPublicGameState({ gameState, playerId: selfPlayer.id }))
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
      getValueMock.mockResolvedValue(JSON.stringify(gameState))
      compressStringMock.mockReturnValue(compressedStateString)

      await mutateGameState(gameState, (state) => {
        state.players[0].coins -= 1
      })

      const expectedState = JSON.stringify({
        ...gameState,
        players: [
          { ...gameState.players[0], coins: gameState.players[0].coins - 1 },
          ...gameState.players.slice(1)
        ]
      })

      expect(compressString).toHaveBeenCalledTimes(1)
      expect(compressString).toHaveBeenCalledWith(expectedState)
      expect(setValueMock).toHaveBeenCalledTimes(1)
      expect(setValueMock).toHaveBeenCalledWith(gameState.roomId.toUpperCase(), compressedStateString, oneDay)
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
      expect(() => validateGameState(gameState)).not.toThrow()
    })

    it.each([
      {
        mutation: (state: GameState) => { state.players.length = 0 },
        error: "Game state must always have 1 to 6 players"
      },
      {
        mutation: (state: GameState) => { state.players.push(...getRandomPlayers(state, 7 - state.players.length)) },
        error: "Game state must always have 1 to 6 players"
      },
      {
        mutation: (state: GameState) => {
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
            pendingPlayers: [],
            claimConfirmed: false
          }
        },
        error: "Everyone has passed but the action is still pending"
      },
      {
        mutation: (state: GameState) => {
          state.pendingBlock = {
            pendingPlayers: [],
            sourcePlayer: chance.pickone(state.players).name,
            claimedInfluence: chance.pickone(Object.values(Influences))
          }
        },
        error: "Everyone has passed but the block is still pending"
      }
    ])('should throw $error', async ({ mutation, error }) => {
      const gameState = getRandomGameState()
      mutation(gameState)
      expect(() => validateGameState(gameState)).toThrow(error)
    })
  })
})
