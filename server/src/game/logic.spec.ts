import { Chance } from "chance"
import { drawCardFromDeck, logEvent } from "../utilities/gameState"
import { GameState, Influences } from '../../../shared/types/game'
import { shuffle } from "../utilities/array"
import { moveTurnToNextPlayer } from "./logic"

jest.mock("../utilities/storage")

const chance = new Chance()

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
