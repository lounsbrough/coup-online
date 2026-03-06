import { firestore } from '../firebase'
import { UserStats, LeaderboardEntry } from '../../../shared/types/user'
import { GameState } from '../../../shared/types/game'
import { GAME_STATE_TTL_MS } from '../../../shared/helpers/constants'

const USERS_COLLECTION = 'users'
const MIN_LOGGED_IN_PLAYERS = 2
const MAX_OPPONENTS = 100

const createEmptyUserStats = (uid: string, displayName: string, photoURL?: string): UserStats => ({
  uid,
  displayName,
  ...(photoURL ? { photoURL } : {}),
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  currentWinStreak: 0,
  currentLossStreak: 0,
  longestWinStreak: 0,
  longestLossStreak: 0,
  totalBluffs: 0,
  successfulBluffs: 0,
  totalChallengesMade: 0,
  successfulChallengesMade: 0,
  timesBluffCaught: 0,
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
        existing.totalBluffs += playerStats.bluffs
        existing.successfulBluffs += playerStats.successfulBluffs
        existing.totalChallengesMade += playerStats.challengesMade
        existing.successfulChallengesMade += playerStats.successfulChallenges
        existing.timesBluffCaught += playerStats.timesBluffCaught
        existing.totalAssassinations += playerStats.assassinations
        existing.totalCoups += playerStats.coups
        existing.totalSteals += Object.values(playerStats.steals).reduce((a, b) => a + b, 0)
        existing.totalTurnsSurvived += playerStats.turnsSurvived
        existing.influenceClaims = mergeInfluenceClaims(
          existing.influenceClaims ?? {},
          playerStats.influenceClaims
        )

        // Achievements
        if (isWinner && playerStats.bluffs === 0) {
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
            displayName: opponent.name,
            gamesPlayedTogether: 0,
            winsAgainst: 0,
            lossesAgainst: 0,
            influenceKillsAgainst: 0,
            influenceKillsBy: 0,
            stealsAgainst: 0,
            challengesMade: 0,
          }

          opponentStats.displayName = opponent.name
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
        if (player.photoURL) {
          existing.photoURL = player.photoURL
        }
        existing.lastPlayedAt = now
        existing.processedGames = { ...processedGames, [gameId]: now }

        transaction.set(userRef, existing)
      })
    } catch (error) {
      console.error(`Failed to record stats for user ${player.uid}:`, error)
    }
  }
}

export const getUserStats = async (uid: string): Promise<UserStats | null> => {
  const doc = await firestore.collection(USERS_COLLECTION).doc(uid).get()
  if (!doc.exists) return null

  const stats = doc.data() as UserStats
  // Don't expose processedGames to clients
  delete (stats as Partial<UserStats>).processedGames
  return stats
}

export const getLeaderboard = async (minGames: number = 5, limit: number = 50): Promise<LeaderboardEntry[]> => {
  const snapshot = await firestore
    .collection(USERS_COLLECTION)
    .where('gamesPlayed', '>=', minGames)
    .orderBy('gamesWon', 'desc')
    .limit(limit * 2) // Fetch extra to sort by win rate in-memory
    .get()

  const entries: LeaderboardEntry[] = snapshot.docs.map((doc) => {
    const data = doc.data() as UserStats
    return {
      uid: data.uid,
      displayName: data.displayName,
      ...(data.photoURL ? { photoURL: data.photoURL } : {}),
      gamesPlayed: data.gamesPlayed,
      gamesWon: data.gamesWon,
      gamesLost: data.gamesLost,
      longestWinStreak: data.longestWinStreak,
      currentWinStreak: data.currentWinStreak,
      winRate: data.gamesPlayed > 0 ? data.gamesWon / data.gamesPlayed : 0,
    }
  })

  return entries
    .sort((a, b) => b.winRate - a.winRate || b.gamesWon - a.gamesWon)
    .slice(0, limit)
}
