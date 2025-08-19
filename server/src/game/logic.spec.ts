import { Chance } from "chance"
import { GameState, Player } from '../../../shared/types/game'
import { moveTurnToNextPlayer, startGame } from "./logic"
import { MAX_PLAYER_COUNT } from "../../../shared/helpers/playerCount"
import { createDeckForPlayerCount } from "../utilities/deck"

jest.mock("../utilities/storage")

const chance = new Chance()

const getRandomPlayers = (count: number) : Player[] =>
  chance.n(() => ({
    id: chance.string(),
    name: chance.string(),
    color: chance.color(),
    coins: 2,
    influences: [],
    claimedInfluences: new Set(),
    unclaimedInfluences: new Set(),
    deadInfluences: [],
    ai: false,
    grudges: {}
  }), count)

const getRandomGameState = ({ playersCount, isStarted }: {
  playersCount?: number
  isStarted?: boolean
} = {}) => {
  const playerCount = playersCount ?? chance.natural({ min: 2, max: MAX_PLAYER_COUNT })

  const players = getRandomPlayers(playerCount)

  const gameState: GameState = {
    deck: createDeckForPlayerCount(playerCount),
    eventLogs: [],
    chatMessages: [],
    lastEventTimestamp: chance.date(),
    isStarted: false,
    availablePlayerColors: chance.n(chance.color, MAX_PLAYER_COUNT),
    players,
    pendingInfluenceLoss: {},
    roomId: chance.string(),
    turn: chance.natural(),
    turnPlayer: chance.pickone(players).name,
    settings: { eventLogRetentionTurns: 100, allowRevive: true }
  }

  if (isStarted) {
    startGame(gameState)
  }

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
      const gameState = getRandomGameState({ isStarted: true })

      let previous = gameState.turnPlayer
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).not.toBe(previous)
      previous = gameState.turnPlayer
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).not.toBe(previous)
    })

    it('should skip players with no influences left', () => {
      const gameState = getRandomGameState({ playersCount: 6, isStarted: true })

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
      const gameState = getRandomGameState({ playersCount: 3, isStarted: true })

      gameState.players[1].influences = []
      gameState.turnPlayer = gameState.players[0].name
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(gameState.players[2].name)
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(gameState.players[0].name)
    })
  })
})
