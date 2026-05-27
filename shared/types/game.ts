export enum Influences {
  Assassin = 'Assassin',
  Contessa = 'Contessa',
  Captain = 'Captain',
  Ambassador = 'Ambassador',
  Inquisitor = 'Inquisitor',
  Duke = 'Duke',
}

export enum Factions {
  Loyalist = 'Loyalist',
  Reformist = 'Reformist',
}

export enum Actions {
  Assassinate = 'Assassinate',
  Steal = 'Steal',
  Coup = 'Coup',
  Tax = 'Tax',
  ForeignAid = 'Foreign Aid',
  Income = 'Income',
  Exchange = 'Exchange',
  Examine = 'Examine',
  Convert = 'Convert',
  Embezzle = 'Embezzle',
  Revive = 'Revive',
}

export enum PlayerActions {
  gameState = 'gameState',
  createGame = 'createGame',
  joinGame = 'joinGame',
  addAiPlayer = 'addAiPlayer',
  removeFromGame = 'removeFromGame',
  startGame = 'startGame',
  resetGame = 'resetGame',
  resetGameRequest = 'resetGameRequest',
  resetGameRequestCancel = 'resetGameRequestCancel',
  forfeit = 'forfeit',
  checkAutoMove = 'checkAutoMove',
  action = 'action',
  actionResponse = 'actionResponse',
  actionChallengeResponse = 'actionChallengeResponse',
  blockResponse = 'blockResponse',
  blockChallengeResponse = 'blockChallengeResponse',
  loseInfluences = 'loseInfluences',
  revealForExamine = 'revealForExamine',
  examineDecision = 'examineDecision',
  sendChatMessage = 'sendChatMessage',
  setChatMessageDeleted = 'setChatMessageDeleted',
  setEmojiOnChatMessage = 'setEmojiOnChatMessage',
}

export enum ServerEvents {
  gameStateChanged = 'gameStateChanged',
  error = 'error',
}

export const InfluenceAttributes: {
  [influence in Influences]: {
    legalAction?: Actions;
    legalBlock?: Actions;
  };
} = {
  [Influences.Assassin]: {
    legalAction: Actions.Assassinate,
  },
  [Influences.Contessa]: {
    legalBlock: Actions.Assassinate,
  },
  [Influences.Captain]: {
    legalAction: Actions.Steal,
    legalBlock: Actions.Steal,
  },
  [Influences.Ambassador]: {
    legalAction: Actions.Exchange,
    legalBlock: Actions.Steal,
  },
  [Influences.Inquisitor]: {
    legalAction: Actions.Examine,
    legalBlock: Actions.Steal,
  },
  [Influences.Duke]: {
    legalAction: Actions.Tax,
    legalBlock: Actions.ForeignAid,
  },
};

export const ActionAttributes: {
  [action in Actions]: {
    blockable: boolean;
    challengeable: boolean;
    coinsRequired?: number;
    influenceRequired?: Influences;
    requiresTarget: boolean;
  };
} = {
  [Actions.Assassinate]: {
    blockable: true,
    challengeable: true,
    coinsRequired: 3,
    influenceRequired: Influences.Assassin,
    requiresTarget: true,
  },
  [Actions.Steal]: {
    blockable: true,
    challengeable: true,
    influenceRequired: Influences.Captain,
    requiresTarget: true,
  },
  [Actions.Coup]: {
    blockable: false,
    challengeable: false,
    coinsRequired: 7,
    requiresTarget: true,
  },
  [Actions.Tax]: {
    blockable: false,
    challengeable: true,
    influenceRequired: Influences.Duke,
    requiresTarget: false,
  },
  [Actions.ForeignAid]: {
    blockable: true,
    challengeable: false,
    requiresTarget: false,
  },
  [Actions.Income]: {
    blockable: false,
    challengeable: false,
    requiresTarget: false,
  },
  [Actions.Exchange]: {
    blockable: false,
    challengeable: true,
    influenceRequired: Influences.Ambassador,
    requiresTarget: false,
  },
  [Actions.Examine]: {
    blockable: false,
    challengeable: true,
    influenceRequired: Influences.Inquisitor,
    requiresTarget: true,
  },
  [Actions.Convert]: {
    blockable: false,
    challengeable: false,
    coinsRequired: 1,
    requiresTarget: false,
  },
  [Actions.Embezzle]: {
    blockable: false,
    challengeable: true,
    requiresTarget: false,
  },
  [Actions.Revive]: {
    blockable: false,
    challengeable: false,
    coinsRequired: 10,
    requiresTarget: false,
  },
};

export enum Responses {
  Pass = 'Pass',
  Challenge = 'Challenge',
  Block = 'Block',
}

export enum EventMessages {
  ActionConfirm = 'ActionConfirm',
  ActionPending = 'ActionPending',
  ActionProcessed = 'ActionProcessed',
  ForcedMoveProcessed = 'ForcedMoveProcessed',
  BlockPending = 'BlockPending',
  BlockSuccessful = 'BlockSuccessful',
  BlockFailed = 'BlockFailed',
  ChallengePending = 'ChallengePending',
  ChallengeSuccessful = 'ChallengeSuccessful',
  ChallengeFailed = 'ChallengeFailed',
  GameStarted = 'GameStarted',
  PlayerDied = 'PlayerDied',
  PlayerForfeited = 'PlayerForfeited',
  PlayerLostInfluence = 'PlayerLostInfluence',
  PlayerReplacedInfluence = 'PlayerReplacedInfluence',
  PlayerReplacedWithAi = 'PlayerReplacedWithAi',
}

export type EventMessage = {
  event: EventMessages;
  action?: Actions;
  primaryPlayer?: string;
  secondaryPlayer?: string;
  influence?: Influences;
  turn: number;
};

export type TimelineEntry = {
  turn: number;
  player: string;
  action: Actions;
  claimedInfluence?: Influences;
  actualHand: Influences[];
  isBluff: boolean;
  outcome: 'unchallenged' | 'challenge_failed' | 'challenge_succeeded' | 'blocked' | 'block_challenged_failed' | 'block_challenged_succeeded';
  challengedBy?: string;
  blockedBy?: string;
  blockClaimedInfluence?: Influences;
  blockIsBluff?: boolean;
  blockChallengedBy?: string;
  targetPlayer?: string;
  waitTimeMs?: number;
};

export type AiPersonality = {
  vengefulness: number;
  honesty: number;
  skepticism: number;
};

export type Player = {
  coins: number;
  color: string;
  id: string;
  influences: Influences[];
  claimedInfluences: Set<Influences>;
  unclaimedInfluences: Set<Influences>;
  deadInfluences: Influences[];
  name: string;
  ai: boolean;
  personalityHidden?: boolean;
  personality?: AiPersonality;
  grudges: {
    [playerName: string]: number;
  };
  uid?: string;
  photoURL?: string;
  faction?: Factions;
};

export type DehydratedPlayer = Omit<
  Player,
  'claimedInfluences' | 'unclaimedInfluences'
> & {
  claimedInfluences: Influences[];
  unclaimedInfluences: Influences[];
};

export type PublicPlayer = Omit<
  Player,
  'id' | 'influences' | 'personalityHidden'
> & {
  influenceCount: number;
};

export type DehydratedPublicPlayer = Omit<
  PublicPlayer,
  'claimedInfluences' | 'unclaimedInfluences'
> & {
  claimedInfluences: Influences[];
  unclaimedInfluences: Influences[];
};

export type GameSettings = {
  eventLogRetentionTurns: number;
  allowRevive: boolean;
  aiMoveDelayMs?: number;
  speedRoundSeconds?: number;
  enableReformation?: boolean;
  useInquisitor?: boolean;
};

export type ChatMessage = {
  id: string;
  from: string;
  timestamp: Date;
  text: string;
  deleted: boolean;
  emojis?: {
    [emoji: string]: Set<string>;
  };
};

export type DehydratedChatMessage = Omit<
  ChatMessage,
  'timestamp' | 'emojis'
> & {
  timestamp: string;
  emojis?: {
    [emoji: string]: string[];
  };
};

type PendingAction = {
  targetPlayer?: string;
  action: Actions;
  pendingPlayers: Set<string>;
  claimConfirmed: boolean;
};

type DehydratedPendingAction = Omit<PendingAction, 'pendingPlayers'> & {
  pendingPlayers: string[];
};

type PendingBlock = {
  sourcePlayer: string;
  claimedInfluence: Influences;
  pendingPlayers: Set<string>;
};

type DehydratedPendingBlock = Omit<PendingBlock, 'pendingPlayers'> & {
  pendingPlayers: string[];
};

export type PendingExamine = {
  examiner: string;
  targetPlayer: string;
  revealedInfluence?: Influences;
};

export type GameState = {
  deck: Influences[];
  eventLogs: EventMessage[];
  chatMessages: ChatMessage[];
  gameTimeline: TimelineEntry[];
  lastEventTimestamp: Date;
  isStarted: boolean;
  availablePlayerColors: string[];
  players: Player[];
  pendingAction?: PendingAction;
  pendingActionChallenge?: {
    sourcePlayer: string;
  };
  pendingBlock?: PendingBlock;
  pendingBlockChallenge?: {
    sourcePlayer: string;
  };
  pendingInfluenceLoss: {
    [player: string]: {
      putBackInDeck: boolean;
    }[];
  };
  pendingExamine?: PendingExamine;
  treasury: number;
  roomId: string;
  turnPlayer?: string;
  turn: number;
  resetGameRequest?: {
    player: string;
  };
  settings: GameSettings;
  gameId?: string;
  gameActionStats?: import('./user').GameActionStats;
};

export type DehydratedGameState = Omit<
  GameState,
  | 'players'
  | 'lastEventTimestamp'
  | 'chatMessages'
  | 'pendingAction'
  | 'pendingBlock'
> & {
  players: DehydratedPlayer[];
  lastEventTimestamp: string;
  chatMessages: DehydratedChatMessage[];
  pendingAction?: DehydratedPendingAction;
  pendingBlock?: DehydratedPendingBlock;
};

export type PublicGameState = Pick<
  GameState,
  | 'eventLogs'
  | 'chatMessages'
  | 'isStarted'
  | 'lastEventTimestamp'
  | 'pendingInfluenceLoss'
  | 'roomId'
  | 'turn'
  | 'settings'
  | 'treasury'
> &
  Partial<
    Pick<
      GameState,
      | 'pendingAction'
      | 'pendingActionChallenge'
      | 'pendingBlock'
      | 'pendingBlockChallenge'
      | 'pendingExamine'
      | 'resetGameRequest'
      | 'turnPlayer'
    >
  > & {
    players: PublicPlayer[];
    selfPlayer?: Player;
    deckCount: number;
    gameTimeline?: TimelineEntry[];
  };

export type DehydratedPublicGameState = Omit<
  PublicGameState,
  | 'players'
  | 'selfPlayer'
  | 'lastEventTimestamp'
  | 'chatMessages'
  | 'pendingAction'
  | 'pendingBlock'
> & {
  players: DehydratedPublicPlayer[];
  selfPlayer?: DehydratedPlayer;
  lastEventTimestamp: string;
  chatMessages: DehydratedChatMessage[];
  pendingAction?: DehydratedPendingAction;
  pendingBlock?: DehydratedPendingBlock;
};
