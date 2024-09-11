import { Chance } from "chance"
import { drawCardFromDeck, getGameState, moveTurnToNextPlayer, getPublicGameState, logEvent, mutateGameState, validateGameState } from "./gameState"
import { GameState, Influences } from '../../shared/types/game'
import { getValue, setValue } from "./storage"
import { shuffle } from "./array"

jest.mock("./storage")
const getValueMock = jest.mocked(getValue)
const setValueMock = jest.mocked(setValue)

const chance = new Chance()
const fifteenMinutes = 900

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

      let newTurnPlayer: string
      await mutateGameState(gameState.roomId, (state) => {
        moveTurnToNextPlayer(state)
        newTurnPlayer = state.turnPlayer
      })

      expect(setValueMock).toHaveBeenCalledTimes(1)
      expect(newTurnPlayer).not.toBe(gameState.turnPlayer)
      expect(setValueMock).toHaveBeenCalledWith(gameState.roomId, JSON.stringify({
        ...gameState,
        turnPlayer: newTurnPlayer
      }), fifteenMinutes)
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
      }
    ])('should throw $error if state is not valid', async ({ mutation, error }) => {
      const gameState = getRandomGameState()
      mutation(gameState)
      expect(() => validateGameState(gameState)).toThrow(error)
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
    const gameState = getRandomGameState()

    const newLog = chance.string()

    let expectedEventLogs = [...gameState.eventLogs, newLog]
    logEvent(gameState, newLog)
    expect(gameState.eventLogs).toEqual(expectedEventLogs)

    gameState.eventLogs = chance.n(chance.string, 100)

    expectedEventLogs = [...gameState.eventLogs.slice(1), newLog]
    logEvent(gameState, newLog)
    expect(gameState.eventLogs).toEqual(expectedEventLogs)
  })

  describe('moveTurnToNextPlayer', () => {
    it('should move turn to next player', () => {
      const gameState = getRandomGameState()

      let previous = gameState.turnPlayer
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).not.toBe(previous)
      previous = gameState.turnPlayer
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).not.toBe(previous)
    })

    it('should skip players with no influences left', () => {
      const gameState = getRandomGameState({ playersCount: 6 })
      gameState.players[1].influences = []
      gameState.players[4].influences = []
      gameState.turnPlayer = gameState.players[0].name
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(gameState.players[2].name)
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(gameState.players[3].name)
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(gameState.players[5].name)
    })

    it('should wrap back to beginning of player list', () => {
      const gameState = getRandomGameState({ playersCount: 3 })
      gameState.players[1].influences = []
      gameState.turnPlayer = gameState.players[0].name
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(gameState.players[2].name)
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(gameState.players[0].name)
    })
  })
})