import { Chance } from "chance"
import { drawCardFromDeck, getGameState, moveTurnToNextPlayer, getPublicGameState, logEvent } from "./gameState"
import { Actions, GameState, Influences, Player } from '../../shared/types/game'
import { getValue } from "./storage"

jest.mock("./storage")
const getValueMock = jest.mocked(getValue)

const chance = new Chance()

const getRandomPlayers = (count?: number) =>
  chance.n(() => ({
    id: chance.string(),
    name: chance.string(),
    color: chance.color(),
    coins: chance.natural({ min: 0, max: 12 }),
    influences: chance.n(() => chance.pickone(Object.values(Influences)), chance.natural({ min: 1, max: 2 }))
  }), count ?? chance.natural({ min: 2, max: 6 }))

const getRandomGameState = (players?: Player[]): GameState => {
  const gamePlayers = players ?? getRandomPlayers()

  return ({
    deadCards: [Influences.Ambassador],
    deck: chance.n(() => chance.pickone(Object.values(Influences)), chance.natural({ min: 1, max: 5 })),
    eventLogs: chance.n(chance.string, chance.natural({ min: 2, max: 10 })),
    isStarted: chance.bool(),
    players: gamePlayers,
    pendingAction: {
      action: chance.pickone(Object.values(Actions)),
      pendingPlayers: chance.n(() => chance.pickone(gamePlayers).name, chance.natural({ min: 1, max: 5 })),
      claimConfirmed: chance.bool()
    },
    pendingActionChallenge: {
      sourcePlayer: chance.pickone(gamePlayers).name
    },
    pendingBlock: {
      sourcePlayer: chance.pickone(gamePlayers).name,
      pendingPlayers: chance.n(() => chance.pickone(gamePlayers).name, chance.natural({ min: 1, max: 5 })),
      claimedInfluence: chance.pickone(Object.values(Influences))
    },
    pendingBlockChallenge: {
      sourcePlayer: chance.pickone(gamePlayers).name
    },
    pendingInfluenceLoss: {
      [chance.string()]: [{ putBackInDeck: chance.bool() }]
    },
    roomId: chance.string(),
    turnPlayer: chance.pickone(gamePlayers).name
  })
}

describe('gameState', () => {
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
      const players = getRandomPlayers(6)
      players[1].influences = []
      players[4].influences = []
      const gameState = getRandomGameState(players)
      gameState.turnPlayer = players[0].name
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(players[2].name)
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(players[3].name)
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(players[5].name)
    })

    it('should wrap back to beginning of player list', () => {
      const players = getRandomPlayers(3)
      players[1].influences = []
      const gameState = getRandomGameState(players)
      gameState.turnPlayer = players[0].name
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(players[2].name)
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(players[0].name)
    })
  })
})
