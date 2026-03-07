import { GameState, Actions, Influences } from '../../../shared/types/game'
import { emptyPlayerActionStats } from '../../../shared/types/user'

/** Ensure stats exist for a player */
const ensureStats = (state: GameState, playerName: string) => {
  if (!state.gameActionStats) return
  if (!state.gameActionStats[playerName]) {
    state.gameActionStats[playerName] = emptyPlayerActionStats()
  }
}

/** Record that a player claimed an influence (for "most claimed influence" stat) */
export const recordInfluenceClaim = (state: GameState, playerName: string, influence: Influences) => {
  if (!state.gameActionStats) return
  ensureStats(state, playerName)
  const claims = state.gameActionStats[playerName].influenceClaims
  claims[influence] = (claims[influence] ?? 0) + 1
}

/** Record that a player bluffed (claimed an influence they don't have) */
export const recordBluff = (state: GameState, playerName: string) => {
  if (!state.gameActionStats) return
  ensureStats(state, playerName)
  state.gameActionStats[playerName].totalBluffsMade++
}

/** Record that a bluff succeeded (wasn't challenged, or challenger was wrong about it) */
export const recordSuccessfulBluff = (state: GameState, playerName: string) => {
  if (!state.gameActionStats) return
  ensureStats(state, playerName)
  state.gameActionStats[playerName].successfulBluffsMade++
}



/** Record that a player made a challenge */
export const recordChallengeMade = (state: GameState, playerName: string) => {
  if (!state.gameActionStats) return
  ensureStats(state, playerName)
  state.gameActionStats[playerName].challengesMade++
}

/** Record that a player's challenge was successful */
export const recordSuccessfulChallenge = (state: GameState, playerName: string) => {
  if (!state.gameActionStats) return
  ensureStats(state, playerName)
  state.gameActionStats[playerName].successfulChallenges++
}

/** Record an influence kill: killer killed targetPlayer's influence */
export const recordInfluenceKill = (state: GameState, killerName: string, targetPlayerName: string) => {
  if (!state.gameActionStats) return
  ensureStats(state, killerName)
  const kills = state.gameActionStats[killerName].influenceKills
  kills[targetPlayerName] = (kills[targetPlayerName] ?? 0) + 1
}

/** Record a steal action against a target */
export const recordSteal = (state: GameState, thiefName: string, targetPlayerName: string) => {
  if (!state.gameActionStats) return
  ensureStats(state, thiefName)
  const steals = state.gameActionStats[thiefName].steals
  steals[targetPlayerName] = (steals[targetPlayerName] ?? 0) + 1
}

/** Record an assassination */
export const recordAssassination = (state: GameState, playerName: string) => {
  if (!state.gameActionStats) return
  ensureStats(state, playerName)
  state.gameActionStats[playerName].assassinations++
}

/** Record a coup */
export const recordCoup = (state: GameState, playerName: string) => {
  if (!state.gameActionStats) return
  ensureStats(state, playerName)
  state.gameActionStats[playerName].coups++
}

/** Increment turns survived for all alive players at turn transition */
export const recordTurnSurvived = (state: GameState) => {
  if (!state.gameActionStats) return
  for (const player of state.players) {
    if (player.influences.length > 0) {
      ensureStats(state, player.name)
      state.gameActionStats[player.name].turnsSurvived++
    }
  }
}
