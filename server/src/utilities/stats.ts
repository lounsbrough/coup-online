import { firestore } from '../firebase'
import { UserStats, LeaderboardResponse, RankedLeaderboardEntry } from '../../../shared/types/user'
import { GameState } from '../../../shared/types/game'
import { GAME_STATE_TTL_MS } from '../../../shared/helpers/constants'
import { TTLCache } from './cache'

const USERS_COLLECTION = 'users'
const MIN_LOGGED_IN_PLAYERS = 2
const MAX_OPPONENTS = 25

/**
 * Wilson score interval lower bound for ranking.
 * https://grokipedia.com/page/Binomial_proportion_confidence_interval
 *
 * Computes the lower bound of a 95% confidence interval for win rate,
 * which naturally accounts for sample size. Players with few games get
 * a conservative (lower) rating, while players with many games converge
 * toward their actual win rate.
 *
 * Formula: (p̂ + z²/2n − z√(p̂(1−p̂)/n + z²/4n²)) / (1 + z²/n)
 * where p̂ = observed win rate, n = games played, z = 1.96 (95% confidence)
 *
 * Returns a value 0–100 (percentage scale).
 */
const wilsonScoreRating = (winRate: number, gamesPlayed: number): number => {
  if (gamesPlayed === 0) return 0
  const z = 1.96 // 95% confidence
  const n = gamesPlayed
  const p = winRate
  const z2 = z * z
  const denominator = 1 + z2 / n
  const centre = p + z2 / (2 * n)
  const margin = z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))
  const lowerBound = (centre - margin) / denominator
  return Math.round(Math.max(0, lowerBound) * 1000) / 10
}

const userStatsCache = new TTLCache<UserStats | null>(30_000)
const displayNameCache = new TTLCache<string | null>(60_000)
const rankedListCache = new TTLCache<RankedLeaderboardEntry[]>(60_000)

const createEmptyUserStats = (uid: string, displayName: string, photoURL?: string): UserStats & { displayNameLower: string } => ({
  uid,
  displayName,
  displayNameLower: displayName.toLowerCase(),
  ...(photoURL ? { photoURL } : {}),
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
})

const purgeOldProcessedGames = (processedGames: { [gameId: string]: string }): { [gameId: string]: string } => {
  const cutoff = Date.now() - GAME_STATE_TTL_MS
  const purged: { [gameId: string]: string } = {}
  for (const [gameId, timestamp] of Object.entries(processedGames)) {
    if (new Date(timestamp).getTime() > cutoff) {
      purged[gameId] = timestamp
    }
  }
  return purged
}

const trimOpponents = (opponents: UserStats['opponents']): UserStats['opponents'] => {
  const entries = Object.entries(opponents)
  if (entries.length <= MAX_OPPONENTS) return opponents

  return Object.fromEntries(
    entries
      .sort(([, a], [, b]) => b.gamesPlayedTogether - a.gamesPlayedTogether)
      .slice(0, MAX_OPPONENTS)
  )
}

const mergeInfluenceClaims = (
  existing: { [influence: string]: number },
  incoming: { [influence: string]: number }
): { [influence: string]: number } => {
  const merged = { ...existing }
  for (const [influence, count] of Object.entries(incoming)) {
    merged[influence] = (merged[influence] ?? 0) + count
  }
  return merged
}

export const recordGameStats = async (gameState: GameState) => {
  const { gameId, gameActionStats, players } = gameState

  if (!gameId || !gameActionStats) return

  // Find the winner (last player alive)
  const alivePlayers = players.filter(({ influences }) => influences.length > 0)
  if (alivePlayers.length !== 1) return // Game not actually over

  const winner = alivePlayers[0]

  // Only count stats if at least MIN_LOGGED_IN_PLAYERS logged-in players
  const loggedInPlayers = players.filter((p) => p.uid)
  if (loggedInPlayers.length < MIN_LOGGED_IN_PLAYERS) return

  const now = new Date().toISOString()

  for (const player of loggedInPlayers) {
    if (!player.uid) continue

    const isWinner = player.name === winner.name
    const playerStats = gameActionStats[player.name]
    if (!playerStats) continue

    const userRef = firestore.collection(USERS_COLLECTION).doc(player.uid)

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await firestore.runTransaction(async (transaction) => {
          const doc = await transaction.get(userRef)
          const existing: UserStats = doc.exists
            ? (doc.data() as UserStats)
            : createEmptyUserStats(player.uid!, player.name, player.photoURL)

        // Purge and check dedup
        const processedGames = purgeOldProcessedGames(existing.processedGames ?? {})
        if (processedGames[gameId]) return // Already processed

        // Core stats
        existing.gamesPlayed++
        if (isWinner) {
          existing.gamesWon++
          existing.currentWinStreak++
          existing.currentLossStreak = 0
          existing.longestWinStreak = Math.max(existing.longestWinStreak, existing.currentWinStreak)
        } else {
          existing.gamesLost++
          existing.currentLossStreak++
          existing.currentWinStreak = 0
          existing.longestLossStreak = Math.max(existing.longestLossStreak, existing.currentLossStreak)
        }

        // Playstyle stats
        existing.totalBluffsMade += playerStats.totalBluffsMade
        existing.successfulBluffsMade += playerStats.successfulBluffsMade
        existing.totalChallengesMade += playerStats.challengesMade
        existing.successfulChallengesMade += playerStats.successfulChallenges
        existing.totalAssassinations += playerStats.assassinations
        existing.totalCoups += playerStats.coups
        existing.totalSteals += Object.values(playerStats.steals).reduce((a, b) => a + b, 0)
        existing.totalTurnsSurvived += playerStats.turnsSurvived
        existing.influenceClaims = mergeInfluenceClaims(
          existing.influenceClaims ?? {},
          playerStats.influenceClaims
        )

        // Achievements
        if (isWinner && playerStats.totalBluffsMade === 0) {
          existing.gamesWonWithoutBluffing++
        }
        if (isWinner && player.deadInfluences.length > 0) {
          existing.gamesWonAfterLosingFirstInfluence++
        }
        if (isWinner) {
          const turnsToWin = gameState.turn
          if (!existing.fewestTurnsToWin || turnsToWin < existing.fewestTurnsToWin) {
            existing.fewestTurnsToWin = turnsToWin
          }
        }

        // Head-to-head stats against other logged-in players
        for (const opponent of loggedInPlayers) {
          if (!opponent.uid || opponent.uid === player.uid) continue

          const opponentStats = existing.opponents[opponent.uid] ?? {
            gamesPlayedTogether: 0,
            winsAgainst: 0,
            lossesAgainst: 0,
            influenceKillsAgainst: 0,
            influenceKillsBy: 0,
            stealsAgainst: 0,
            challengesMade: 0,
          }

          opponentStats.gamesPlayedTogether++
          if (isWinner) opponentStats.winsAgainst++
          if (opponent.name === winner.name) opponentStats.lossesAgainst++

          // Influence kills against this opponent
          opponentStats.influenceKillsAgainst += playerStats.influenceKills[opponent.name] ?? 0

          // Influence kills BY this opponent against us
          const opponentActionStats = gameActionStats[opponent.name]
          if (opponentActionStats) {
            opponentStats.influenceKillsBy += opponentActionStats.influenceKills[player.name] ?? 0
          }

          // Steals against this opponent
          opponentStats.stealsAgainst += playerStats.steals[opponent.name] ?? 0

          // Challenges we made against this opponent (tracked as total from this game)
          opponentStats.challengesMade += playerStats.challengesMade

          existing.opponents[opponent.uid] = opponentStats
        }

        // Trim opponents map to prevent unbounded growth
        existing.opponents = trimOpponents(existing.opponents)

        // Update metadata
        existing.displayName = player.name
          ; (existing as UserStats & { displayNameLower: string }).displayNameLower = player.name.toLowerCase()
        if (player.photoURL) {
          existing.photoURL = player.photoURL
        }
        existing.lastPlayedAt = now
        existing.processedGames = { ...processedGames, [gameId]: now }

        transaction.set(userRef, existing)
      })

        // Invalidate caches for this player
        userStatsCache.invalidate(player.uid)
        displayNameCache.invalidate(player.uid)
        break
      } catch (error) {
        if (attempt === 3) {
          console.error(`Failed to record stats for user ${player.uid} after 3 attempts:`, error)
        } else {
          await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
        }
      }
    }
  }

  rankedListCache.clear()
}

export const getUserStats = async (uid: string): Promise<UserStats | null> => {
  const cached = userStatsCache.get(uid)
  if (cached !== undefined) return cached

  const doc = await firestore.collection(USERS_COLLECTION).doc(uid).get()
  if (!doc.exists) return null

  const stats = doc.data() as UserStats
  // Don't expose processedGames to clients
  delete (stats as Partial<UserStats>).processedGames

  // Resolve current display names for opponents via batch read
  const opponentUids = Object.keys(stats.opponents || {})
  if (opponentUids.length > 0) {
    const refs = opponentUids.map(id => firestore.collection(USERS_COLLECTION).doc(id))
    const docs = await firestore.getAll(...refs)
    for (const opponentDoc of docs) {
      if (opponentDoc.exists && stats.opponents[opponentDoc.id]) {
        const opponentData = opponentDoc.data() as UserStats
        stats.opponents[opponentDoc.id].displayName = opponentData.displayName
      }
    }
  }

  userStatsCache.set(uid, stats)
  return stats
}

export const getDisplayName = async (uid: string): Promise<string | null> => {
  const cached = displayNameCache.get(uid)
  if (cached !== undefined) return cached

  const doc = await firestore.collection(USERS_COLLECTION).doc(uid).get()
  if (!doc.exists) {
    displayNameCache.set(uid, null)
    return null
  }
  const name = (doc.data() as UserStats).displayName
  displayNameCache.set(uid, name)
  return name
}

export const setDisplayName = async (uid: string, displayName: string, photoURL?: string): Promise<{ error?: string }> => {
  const displayNameLower = displayName.toLowerCase()

  // Check if another user already has this name (case-insensitive)
  const existing = await firestore.collection(USERS_COLLECTION)
    .where('displayNameLower', '==', displayNameLower)
    .limit(1)
    .get()

  if (!existing.empty && existing.docs[0].id !== uid) {
    return { error: 'displayNameTaken' }
  }

  const userRef = firestore.collection(USERS_COLLECTION).doc(uid)
  const doc = await userRef.get()

  if (doc.exists) {
    await userRef.update({ displayName, displayNameLower })
  } else {
    const newStats = createEmptyUserStats(uid, displayName, photoURL)
    await userRef.set(newStats)
  }

  userStatsCache.invalidate(uid)
  displayNameCache.invalidate(uid)
  rankedListCache.clear()

  return {}
}

export const deleteUserStats = async (uid: string): Promise<void> => {
  await firestore.collection(USERS_COLLECTION).doc(uid).delete()
  userStatsCache.invalidate(uid)
  displayNameCache.invalidate(uid)
  rankedListCache.clear()
}

const getRankedList = async (minGames: number): Promise<RankedLeaderboardEntry[]> => {
  const cacheKey = `ranked:${minGames}`
  const cached = rankedListCache.get(cacheKey)
  if (cached) return cached

  const snapshot = await firestore
    .collection(USERS_COLLECTION)
    .where('gamesPlayed', '>=', minGames)
    .get()

  const entries: RankedLeaderboardEntry[] = snapshot.docs
    .map((doc) => {
      const data = doc.data() as UserStats
      const winRate = data.gamesPlayed > 0 ? data.gamesWon / data.gamesPlayed : 0
      return {
        uid: data.uid,
        displayName: data.displayName,
        ...(data.photoURL ? { photoURL: data.photoURL } : {}),
        gamesPlayed: data.gamesPlayed,
        gamesWon: data.gamesWon,
        gamesLost: data.gamesLost,
        longestWinStreak: data.longestWinStreak,
        currentWinStreak: data.currentWinStreak,
        winRate,
        rating: wilsonScoreRating(winRate, data.gamesPlayed),
      }
    })
    .sort((a, b) => b.rating - a.rating || b.gamesWon - a.gamesWon)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  rankedListCache.set(cacheKey, entries)
  return entries
}

export const getLeaderboard = async (minGames: number = 5, limit: number = 50, uid?: string): Promise<LeaderboardResponse> => {
  const rankedList = await getRankedList(minGames)
  const entries = rankedList.slice(0, limit)

  let userEntry: RankedLeaderboardEntry | undefined
  if (uid && !entries.some((e) => e.uid === uid)) {
    userEntry = rankedList.find((e) => e.uid === uid)
  }

  return { entries, ...(userEntry ? { userEntry } : {}) }
}
