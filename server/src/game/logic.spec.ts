import { Chance } from "chance"
import { drawCardFromDeck } from "../utilities/gameState"
import { GameState, Influences, Player } from '../../../shared/types/game'
import { shuffle } from "../utilities/array"
import { moveTurnToNextPlayer, startGame } from "./logic"

jest.mock("../utilities/storage")

const chance = new Chance()

const getRandomPlayers = (count?: number) : Player[] =>
  chance.n(() => ({
    id: chance.string(),
    name: chance.string(),
    color: chance.color(),
    coins: 2,
    influences: [],
    claimedInfluences: [],
    unclaimedInfluences: [],
    deadInfluences: [],
    ai: false,
    grudges: {}
  }), count ?? chance.natural({ min: 2, max: 6 }))

const getRandomGameState = ({ playersCount }: { playersCount?: number } = {}) => {
  const players = getRandomPlayers(playersCount)

  const gameState: GameState = {
    deck: shuffle(Object.values(Influences)
      .flatMap((influence) => Array.from({ length: 3 }, () => influence))),
    eventLogs: [],
    chatMessages: [],
    lastEventTimestamp: chance.date(),
    isStarted: chance.bool(),
    availablePlayerColors: chance.n(chance.color, 6),
    players,
    pendingInfluenceLoss: {},
    roomId: chance.string(),
    turn: chance.natural(),
    turnPlayer: chance.pickone(players).name,
    settings: { eventLogRetentionTurns: 100 }
  }

  gameState.players.forEach((player) => {
    player.influences.push(...Array.from({ length: 2 }, () => drawCardFromDeck(gameState)))
  })

  return gameState
}

describe('logic', () => {
  afterEach(jest.clearAllMocks)

  describe('startGame', () => {
    it('should set started flag', () => {
      const gameState = getRandomGameState()
      gameState.isStarted = false
      startGame(gameState)
      expect(gameState.isStarted).toBe(true)
    })

    it('should give starting player 1 coin in 2 player game', () => {
      const gameState = getRandomGameState({ playersCount: 2 })
      gameState.isStarted = false
      startGame(gameState)
      expect(gameState.players[0].coins).toBe(1)
    })

    it('should set turn to 1', () => {
      const gameState = getRandomGameState({ playersCount: 2 })
      startGame(gameState)
      expect(gameState.turn).toBe(1)
    })
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
