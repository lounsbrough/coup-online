import { Chance } from "chance"
import { drawCardFromDeck, getGameState, getPublicGameState, mutateGameState, validateGameState } from "./gameState"
import { Actions, GameState, Influences } from '../../../shared/types/game'
import { getValue, setValue } from "./storage"
import { shuffle } from "./array"

jest.mock("./storage")
const getValueMock = jest.mocked(getValue)
const setValueMock = jest.mocked(setValue)

const chance = new Chance()
const oneDay = 86400

const getRandomPlayers = (count?: number) =>
  chance.n(() => ({
    id: chance.string(),
    name: chance.string(),
    color: chance.color(),
    coins: 2,
    influences: []
  }), count ?? chance.natural({ min: 2, max: 6 }))

const getRandomGameState = ({ playersCount }: { playersCount?: number } = {}) => {
  const players = getRandomPlayers(playersCount)

  const gameState: GameState = {
    deadCards: [],
    deck: shuffle(Object.values(Influences)
      .flatMap((influence) => Array.from({ length: 3 }, () => influence))),
    eventLogs: chance.n(chance.string, chance.natural({ min: 2, max: 10 })),
    isStarted: chance.bool(),
    players,
    pendingAction: undefined,
    pendingActionChallenge: undefined,
    pendingBlock: undefined,
    pendingBlockChallenge: undefined,
    pendingInfluenceLoss: {},
    roomId: chance.string(),
    turnPlayer: chance.pickone(players).name
  }

  gameState.players.forEach((player) => {
    player.influences.push(...Array.from({ length: 2 }, () => drawCardFromDeck(gameState)))
  })

  return gameState
}

describe('gameState', () => {
  afterEach(jest.clearAllMocks)

  describe('getGameState', () => {
    it('should get game state object from storage by room id key', async () => {
      const roomId = 'some room'
      const gameState = getRandomGameState()
      getValueMock.mockResolvedValue(JSON.stringify(gameState))

      expect(await getGameState(roomId)).toEqual(gameState)
      expect(getValueMock).toHaveBeenCalledTimes(1)
      expect(getValueMock).toHaveBeenCalledWith(roomId)
    })
  })

  describe('getPublicGameState', () => {
    it('should get portion of game state that is accessible to player', async () => {
      const gameState = getRandomGameState()
      const selfPlayer = chance.pickone(gameState.players)
      getValueMock.mockResolvedValue(JSON.stringify(gameState))

      const publicGameState = {
        ...gameState,
        selfPlayer: {
          id: selfPlayer.id,
          name: selfPlayer.name,
          color: selfPlayer.color,
          coins: selfPlayer.coins,
          influences: selfPlayer.influences
        },
        players: gameState.players.map((player) => ({
          name: player.name,
          color: player.color,
          coins: player.coins,
          influenceCount: player.influences.length
        }))
      }
      delete publicGameState.deck

      expect(await getPublicGameState(gameState.roomId, selfPlayer.id))
        .toStrictEqual(publicGameState)
    })
  })

  describe('mutateGameState', () => {
    it('should validate state before updating storage', async () => {
      const gameState = getRandomGameState()
      getValueMock.mockResolvedValue(JSON.stringify(gameState))

      await expect(mutateGameState(gameState.roomId, (state) => {
        state.players[0].influences = []
        state.turnPlayer = state.players[0].name
      })).rejects.toThrow()

      expect(setValueMock).not.toHaveBeenCalled()
    })

    it('should update storage with new state', async () => {
      const gameState = getRandomGameState()
      getValueMock.mockResolvedValue(JSON.stringify(gameState))

      await mutateGameState(gameState.roomId, (state) => {
        state.players[0].coins -= 1
      })

      expect(setValueMock).toHaveBeenCalledTimes(1)
      expect(setValueMock).toHaveBeenCalledWith(gameState.roomId, JSON.stringify({
        ...gameState,
        players: [
          { ...gameState.players[0], coins: gameState.players[0].coins - 1 },
          ...gameState.players.slice(1)
        ]
      }), oneDay)
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
          state.deadCards.push(killedInfluence)
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
        mutation: (state: GameState) => { state.players = getRandomPlayers(7) },
        error: "Game state must always have 1 to 6 players"
      },
      {
        mutation: (state: GameState) => {
          state.players[0].influences.push(...[drawCardFromDeck(state), drawCardFromDeck(state)])
          state.pendingInfluenceLoss[state.players[0].name] = [{ putBackInDeck: true }]
        },
        error: "Players must have at most 2 influences"
      },
      {
        mutation: (state: GameState) => { state.players[0].influences.splice(0, 1) },
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
