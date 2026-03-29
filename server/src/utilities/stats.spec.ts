import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Chance } from 'chance'
import { wilsonScoreRating, recordGameStats, getLeaderboard } from './stats'
import { GameState, Influences } from '../../../shared/types/game'
import { emptyPlayerActionStats, UserStats } from '../../../shared/types/user'

const chance = new Chance()

// Mock firebase before importing stats (stats imports firestore)
const mockTransaction = {
  get: vi.fn(),
  set: vi.fn(),
}
const mockRunTransaction = vi.fn(async (fn: (t: typeof mockTransaction) => Promise<void>) => {
  await fn(mockTransaction)
})
const mockCollection = vi.fn()
const mockDoc = vi.fn()

vi.mock('../firebase', () => ({
  firestore: {
    collection: (...args: unknown[]) => mockCollection(...args),
    runTransaction: (fn: (t: typeof mockTransaction) => Promise<void>) => mockRunTransaction(fn),
  },
}))

// Wire up the collection → doc → get chain
mockCollection.mockReturnValue({ doc: mockDoc })
mockDoc.mockReturnValue({})

const createTestGameState = ({
  playerCount = 2,
  withWinner = true,
}: {
  playerCount?: number
  withWinner?: boolean
} = {}): GameState => {
  const players = Array.from({ length: playerCount }, (_, i) => ({
    id: chance.guid(),
    uid: `uid-${i}`,
    name: `Player ${i}`,
    color: chance.color(),
    coins: 2,
    influences: withWinner && i > 0
      ? [] as Influences[]
      : [Influences.Duke] as Influences[],
    claimedInfluences: new Set<Influences>(),
    unclaimedInfluences: new Set<Influences>(),
    deadInfluences: withWinner && i > 0
      ? [Influences.Captain] as Influences[]
      : [] as Influences[],
    ai: false,
    grudges: {},
  }))

  const actionStats = Object.fromEntries(
    players.map((p) => [p.name, {
      ...emptyPlayerActionStats(),
      turnsSurvived: chance.natural({ min: 1, max: 20 }),
    }])
  )

  return {
    deck: [],
    eventLogs: [],
    chatMessages: [],
    lastEventTimestamp: new Date(),
    isStarted: true,
    availablePlayerColors: [],
    players,
    pendingInfluenceLoss: {},
    roomId: chance.string({ length: 6 }),
    turn: 10,
    settings: { eventLogRetentionTurns: 100, allowRevive: false },
    gameId: chance.guid(),
    gameActionStats: actionStats,
  }
}

describe('stats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCollection.mockReturnValue({ doc: mockDoc })
    mockDoc.mockReturnValue({})
  })

  describe('wilsonScoreRating', () => {
    it('should return 0 for zero games played', () => {
      expect(wilsonScoreRating(0.5, 0)).toBe(0)
      expect(wilsonScoreRating(1.0, 0)).toBe(0)
    })

    it('should return a lower rating for few games than many games at the same win rate', () => {
      const ratingFewGames = wilsonScoreRating(0.8, 5)
      const ratingManyGames = wilsonScoreRating(0.8, 100)
      const ratingLotsOfGames = wilsonScoreRating(0.8, 1000)

      expect(ratingFewGames).toBeLessThan(ratingManyGames)
      expect(ratingManyGames).toBeLessThan(ratingLotsOfGames)
    })

    it('should rate a high-volume moderate winner above a low-volume perfect winner', () => {
      // 3/3 wins = 100% win rate but only 3 games
      const perfectButFew = wilsonScoreRating(1.0, 3)
      // 950/1000 wins = 95% win rate with 1000 games
      const consistentVeteran = wilsonScoreRating(0.95, 1000)

      expect(consistentVeteran).toBeGreaterThan(perfectButFew)
    })

    it('should return values between 0 and 100', () => {
      const cases = [
        { winRate: 0, games: 10 },
        { winRate: 0.5, games: 10 },
        { winRate: 1.0, games: 10 },
        { winRate: 0.5, games: 1000 },
        { winRate: 1.0, games: 1 },
      ]

      for (const { winRate, games } of cases) {
        const rating = wilsonScoreRating(winRate, games)
        expect(rating).toBeGreaterThanOrEqual(0)
        expect(rating).toBeLessThanOrEqual(100)
      }
    })

    it('should converge toward the actual win rate for large sample sizes', () => {
      const winRate = 0.6
      const rating = wilsonScoreRating(winRate, 100_000)
      // With 100k games, the Wilson lower bound should be very close to the actual rate
      expect(rating).toBeCloseTo(winRate * 100, 0)
    })

    it('should return 0 for a player with 0% win rate', () => {
      expect(wilsonScoreRating(0, 10)).toBe(0)
      expect(wilsonScoreRating(0, 100)).toBe(0)
    })

    it('should produce consistent known values', () => {
      // 50% win rate, 20 games
      const rating = wilsonScoreRating(0.5, 20)
      expect(rating).toBeGreaterThan(25)
      expect(rating).toBeLessThan(50)
    })
  })

  describe('recordGameStats', () => {
    it('should skip recording if gameId is missing', async () => {
      const gameState = createTestGameState()
      delete gameState.gameId

      await recordGameStats(gameState)

      expect(mockRunTransaction).not.toHaveBeenCalled()
    })

    it('should skip recording if gameActionStats is missing', async () => {
      const gameState = createTestGameState()
      delete gameState.gameActionStats

      await recordGameStats(gameState)

      expect(mockRunTransaction).not.toHaveBeenCalled()
    })

    it('should skip recording if game is not over (multiple alive)', async () => {
      const gameState = createTestGameState({ withWinner: false })

      await recordGameStats(gameState)

      expect(mockRunTransaction).not.toHaveBeenCalled()
    })

    it('should skip recording if fewer than 2 logged-in players', async () => {
      const gameState = createTestGameState()
      // Remove uid from all but one player
      gameState.players.forEach((p, i) => {
        if (i > 0) delete (p as Partial<typeof p>).uid
      })

      await recordGameStats(gameState)

      expect(mockRunTransaction).not.toHaveBeenCalled()
    })

    it('should record stats for each logged-in player', async () => {
      const gameState = createTestGameState({ playerCount: 3 })

      mockTransaction.get.mockResolvedValue({ exists: false })

      await recordGameStats(gameState)

      // 3 players, each should have a transaction
      expect(mockRunTransaction).toHaveBeenCalledTimes(3)
    })

    it('should skip duplicate game processing', async () => {
      const gameState = createTestGameState()

      mockTransaction.get.mockResolvedValue({
        exists: true,
        data: () => ({
          ...createEmptyStats(),
          processedGames: { [gameState.gameId!]: new Date().toISOString() },
        }),
      })

      await recordGameStats(gameState)

      // Transactions run but set should not be called (dedup)
      expect(mockTransaction.set).not.toHaveBeenCalled()
    })

    it('should increment gamesWon for the winner', async () => {
      const gameState = createTestGameState()

      mockTransaction.get.mockResolvedValue({
        exists: true,
        data: () => createEmptyStats(),
      })

      await recordGameStats(gameState)

      // First player is the winner (has influences)
      const winnerSetCall = mockTransaction.set.mock.calls.find(
        ([, stats]: [unknown, UserStats]) => stats.gamesWon === 1
      )
      expect(winnerSetCall).toBeDefined()
    })

    it('should increment gamesLost for losers', async () => {
      const gameState = createTestGameState()

      mockTransaction.get.mockResolvedValue({
        exists: true,
        data: () => createEmptyStats(),
      })

      await recordGameStats(gameState)

      const loserSetCall = mockTransaction.set.mock.calls.find(
        ([, stats]: [unknown, UserStats]) => stats.gamesLost === 1
      )
      expect(loserSetCall).toBeDefined()
    })

    it('should retry up to 3 times on transaction failure then give up', async () => {
      vi.useFakeTimers()
      const gameState = createTestGameState()

      mockRunTransaction.mockRejectedValue(new Error('Firestore unavailable'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const promise = recordGameStats(gameState)

      // Advance past retry delays for both players (500ms + 1000ms each)
      await vi.advanceTimersByTimeAsync(500)
      await vi.advanceTimersByTimeAsync(1000)
      await vi.advanceTimersByTimeAsync(500)
      await vi.advanceTimersByTimeAsync(1000)

      await promise

      // 2 players × 3 attempts = 6 transaction calls
      expect(mockRunTransaction).toHaveBeenCalledTimes(6)
      expect(consoleSpy).toHaveBeenCalledTimes(2)
      expect(consoleSpy.mock.calls[0][0]).toContain('after 3 attempts')

      consoleSpy.mockRestore()
      vi.useRealTimers()
    })

    it('should succeed on second attempt after first failure', async () => {
      vi.useFakeTimers()
      const gameState = createTestGameState()

      // First call fails, second succeeds for each player
      let callCount = 0
      mockRunTransaction.mockImplementation(async (fn) => {
        callCount++
        if (callCount % 2 === 1) throw new Error('Transient error')
        mockTransaction.get.mockResolvedValue({
          exists: true,
          data: () => createEmptyStats(),
        })
        await fn(mockTransaction)
      })

      const promise = recordGameStats(gameState)
      await vi.advanceTimersByTimeAsync(500)
      await vi.advanceTimersByTimeAsync(500)
      await promise

      // 2 players × 2 attempts each (fail then succeed) = 4
      expect(mockRunTransaction).toHaveBeenCalledTimes(4)
      expect(mockTransaction.set).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })
  })

  describe('getLeaderboard', () => {
    const mockGet = vi.fn()
    const mockWhere = vi.fn()

    beforeEach(() => {
      mockGet.mockReset()
      mockWhere.mockReset()
      mockWhere.mockReturnValue({ get: mockGet })
      mockCollection.mockReturnValue({ doc: mockDoc, where: mockWhere })
    })

    it('should return userEntry for a user below the minGames threshold', async () => {
      const veteranData: Partial<UserStats> = {
        uid: 'veteran-uid',
        displayName: 'Veteran',
        gamesPlayed: 10,
        gamesWon: 8,
        gamesLost: 2,
        longestWinStreak: 5,
        currentWinStreak: 3,
      }
      const newUserData: Partial<UserStats> = {
        uid: 'new-uid',
        displayName: 'NewUser',
        gamesPlayed: 1,
        gamesWon: 1,
        gamesLost: 0,
        longestWinStreak: 1,
        currentWinStreak: 1,
      }

      // minGames=1 includes the new user in the main ranked list — no fallback query
      mockGet.mockResolvedValueOnce({
        docs: [{ data: () => veteranData }, { data: () => newUserData }],
      })

      const result = await getLeaderboard(1, 50, 'new-uid')

      expect(result.entries).toHaveLength(2)
      // new-uid is inside the top 50 so no separate userEntry needed
      expect(result.entries.some((e) => e.uid === 'new-uid')).toBe(true)
      expect(result.userEntry).toBeUndefined()
    })

    it('should not return userEntry for a user with zero games played', async () => {
      // getRankedList(2) — empty (user has 0 games, filtered out by >= 2)
      mockGet.mockResolvedValueOnce({ docs: [] })

      const result = await getLeaderboard(2, 50, 'no-games-uid')

      expect(result.entries).toHaveLength(0)
      expect(result.userEntry).toBeUndefined()
    })

    it('should return userEntry for a user in rankedList but outside top limit', async () => {
      const users = Array.from({ length: 5 }, (_, i) => ({
        uid: `uid-${i}`,
        displayName: `Player ${i}`,
        gamesPlayed: 10,
        gamesWon: 10 - i,
        gamesLost: i,
        longestWinStreak: 5,
        currentWinStreak: 0,
      }))

      // getRankedList(300) returns all 5 users
      mockGet.mockResolvedValueOnce({ docs: users.map((u) => ({ data: () => u })) })

      // limit=2, user uid-4 is outside top 2
      const result = await getLeaderboard(300, 2, 'uid-4')

      expect(result.entries).toHaveLength(2)
      expect(result.userEntry).toBeDefined()
      expect(result.userEntry?.uid).toBe('uid-4')
    })
  })
})

function createEmptyStats(): UserStats {
  return {
    uid: 'test-uid',
    displayName: 'Test',
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    currentWinStreak: 0,
    currentLossStreak: 0,
    longestWinStreak: 0,
    longestLossStreak: 0,
    totalBluffsMade: 0,
    successfulBluffsMade: 0,
    totalChallengesMade: 0,
    successfulChallengesMade: 0,
    totalAssassinations: 0,
    totalCoups: 0,
    totalSteals: 0,
    totalTurnsSurvived: 0,
    influenceClaims: {},
    gamesWonWithoutBluffing: 0,
    gamesWonAfterLosingFirstInfluence: 0,
    opponents: {},
    processedGames: {},
    createdAt: new Date().toISOString(),
  }
}
