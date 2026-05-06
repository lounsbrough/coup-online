export type PlayerActionStats = {
  totalBluffsMade: number;
  successfulBluffsMade: number;
  challengesMade: number;
  successfulChallenges: number;
  influenceKills: { [targetPlayer: string]: number };
  steals: { [targetPlayer: string]: number };
  assassinations: number;
  coups: number;
  turnsSurvived: number;
  influenceClaims: { [influence: string]: number };
};

export type GameActionStats = {
  [playerName: string]: PlayerActionStats;
};

export const emptyPlayerActionStats = (): PlayerActionStats => ({
  totalBluffsMade: 0,
  successfulBluffsMade: 0,
  challengesMade: 0,
  successfulChallenges: 0,
  influenceKills: {},
  steals: {},
  assassinations: 0,
  coups: 0,
  turnsSurvived: 0,
  influenceClaims: {},
});

export type OpponentStats = {
  displayName: string;
  gamesPlayedTogether: number;
  winsAgainst: number;
  lossesAgainst: number;
  influenceKillsAgainst: number;
  influenceKillsBy: number;
  stealsAgainst: number;
  challengesMade: number;
};

export type UserStats = {
  uid: string;
  displayName: string;
  photoURL?: string;

  // Core
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  currentWinStreak: number;
  currentLossStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;

  // Playstyle
  totalBluffsMade: number;
  successfulBluffsMade: number;
  totalChallengesMade: number;
  successfulChallengesMade: number;
  totalAssassinations: number;
  totalCoups: number;
  totalSteals: number;
  totalTurnsSurvived: number;
  influenceClaims: { [influence: string]: number };

  // Achievements
  gamesWonWithoutBluffing: number;
  gamesWonAfterLosingFirstInfluence: number;
  fewestTurnsToWin?: number;

  // Head-to-head
  opponents: {
    [opponentUid: string]: OpponentStats;
  };

  // Dedup
  processedGames: {
    [gameId: string]: string; // ISO timestamp
  };

  // Monetization
  premiumStatus?: {
    isActive: boolean;
    tier: 'premium_monthly' | 'premium_annual' | 'supporter';
    expiresAt?: string;
  };

  lastPlayedAt?: string;
  createdAt: string;
};

export type LeaderboardEntry = Pick<
  UserStats,
  'uid' | 'displayName' | 'photoURL' | 'gamesPlayed' | 'gamesWon' | 'gamesLost' | 'longestWinStreak' | 'currentWinStreak'
> & {
  winRate: number;
  rating: number;
};

export type RankedLeaderboardEntry = LeaderboardEntry & {
  rank: number;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
  userEntry?: RankedLeaderboardEntry;
};
