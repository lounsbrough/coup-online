import { vi, describe, it, expect, afterEach } from 'vitest'
import { Chance } from 'chance'
import { Factions, GameState, Player } from '../../../shared/types/game'
import { moveTurnToNextPlayer, startGame } from './logic'
import { sameActiveFaction } from '../../../shared/game/logic'
import { MAX_PLAYER_COUNT } from '../../../shared/helpers/playerCount'
import { createDeckForPlayerCount } from '../utilities/deck'

vi.mock('../utilities/storage')

const chance = new Chance()

const getRandomPlayers = (count: number): Player[] =>
  chance.n(
    () => ({
      id: chance.string(),
      name: chance.string(),
      color: chance.color(),
      coins: 2,
      influences: [],
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
  isStarted,
}: {
  playersCount?: number;
  isStarted?: boolean;
} = {}) => {
  const playerCount =
    playersCount ?? chance.natural({ min: 2, max: MAX_PLAYER_COUNT })

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
    treasury: 0,
    turn: chance.natural(),
    turnPlayer: chance.pickone(players).name,
    settings: { eventLogRetentionTurns: 100, allowRevive: true },
    gameTimeline: [],
  }

  if (isStarted) {
    startGame(gameState)
  }

  return gameState
}

describe('logic', () => {
  afterEach(() => vi.clearAllMocks())

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
      const gameState = getRandomGameState({
        playersCount: 6,
        isStarted: true,
      })

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
      const gameState = getRandomGameState({
        playersCount: 3,
        isStarted: true,
      })

      gameState.players[1].influences = []
      gameState.turnPlayer = gameState.players[0].name
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(gameState.players[2].name)
      moveTurnToNextPlayer(gameState)
      expect(gameState.turnPlayer).toBe(gameState.players[0].name)
    })
  })

  describe('sameActiveFaction', () => {
    const makeGameState = (players: { name: string; faction?: Factions; influenceCount?: number }[], enableReformation = true) => ({
      settings: { enableReformation } as GameState['settings'],
      players,
    })

    it('returns false when reformation is disabled', () => {
      const state = makeGameState([
        { name: 'A', faction: Factions.Loyalist, influenceCount: 2 },
        { name: 'B', faction: Factions.Loyalist, influenceCount: 2 },
      ], false)
      expect(sameActiveFaction(state, 'A', 'B')).toBe(false)
    })

    it('returns false when all alive players are same faction', () => {
      const state = makeGameState([
        { name: 'A', faction: Factions.Loyalist, influenceCount: 2 },
        { name: 'B', faction: Factions.Loyalist, influenceCount: 2 },
        { name: 'C', faction: Factions.Reformist, influenceCount: 0 },
      ])
      expect(sameActiveFaction(state, 'A', 'B')).toBe(false)
    })

    it('returns true when two players share faction and factions are mixed', () => {
      const state = makeGameState([
        { name: 'A', faction: Factions.Loyalist, influenceCount: 2 },
        { name: 'B', faction: Factions.Loyalist, influenceCount: 2 },
        { name: 'C', faction: Factions.Reformist, influenceCount: 2 },
      ])
      expect(sameActiveFaction(state, 'A', 'B')).toBe(true)
    })

    it('returns false when two players have different factions', () => {
      const state = makeGameState([
        { name: 'A', faction: Factions.Loyalist, influenceCount: 2 },
        { name: 'B', faction: Factions.Reformist, influenceCount: 2 },
        { name: 'C', faction: Factions.Loyalist, influenceCount: 2 },
      ])
      expect(sameActiveFaction(state, 'A', 'B')).toBe(false)
    })

    it('ignores dead players when checking if all same faction', () => {
      const state = makeGameState([
        { name: 'A', faction: Factions.Loyalist, influenceCount: 2 },
        { name: 'B', faction: Factions.Loyalist, influenceCount: 1 },
        { name: 'C', faction: Factions.Reformist, influenceCount: 0 },
      ])
      // C is dead, only A and B alive -> all same faction -> returns false
      expect(sameActiveFaction(state, 'A', 'B')).toBe(false)
    })

    it('returns false when player is dead', () => {
      const state = makeGameState([
        { name: 'A', faction: Factions.Loyalist, influenceCount: 2 },
        { name: 'B', faction: Factions.Loyalist, influenceCount: 0 },
        { name: 'C', faction: Factions.Reformist, influenceCount: 2 },
      ])
      // B is dead, not in alive players
      expect(sameActiveFaction(state, 'A', 'B')).toBe(false)
    })

    it('works with influences array instead of influenceCount', () => {
      const state = {
        settings: { enableReformation: true } as GameState['settings'],
        players: [
          { name: 'A', faction: Factions.Loyalist, influences: ['x', 'y'] },
          { name: 'B', faction: Factions.Loyalist, influences: ['z'] },
          { name: 'C', faction: Factions.Reformist, influences: ['w'] },
        ],
      }
      expect(sameActiveFaction(state, 'A', 'B')).toBe(true)
    })
  })
})
