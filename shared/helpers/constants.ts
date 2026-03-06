/** Redis TTL for game state, in seconds (31 days) */
export const GAME_STATE_TTL_SECONDS = 2_678_400

/** Same TTL in milliseconds, for Date comparisons */
export const GAME_STATE_TTL_MS = GAME_STATE_TTL_SECONDS * 1000
