export enum Influences {
  Assassin = 'Assassin',
  Contessa = 'Contessa',
  Captain = 'Captain',
  Ambassador = 'Ambassador',
  Duke = 'Duke'
}

export enum Actions {
  Assassinate = 'Assassinate',
  Steal = 'Steal',
  Coup = 'Coup',
  Tax = 'Tax',
  ForeignAid = 'Foreign Aid',
  Income = 'Income',
  Exchange = 'Exchange'
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
  resetGameRequestCancel = "resetGameRequestCancel",
  checkAiMove = "checkAiMove",
  action = 'action',
  actionResponse = 'actionResponse',
  actionChallengeResponse = 'actionChallengeResponse',
  blockResponse = 'blockResponse',
  blockChallengeResponse = 'blockChallengeResponse',
  loseInfluences = 'loseInfluences'
}

export enum ServerEvents {
  gameStateChanged = 'gameStateChanged',
  error = 'error'
}

export const InfluenceAttributes: {
  [influence in Influences]: {
    legalAction?: Actions
    legalBlock?: Actions
  }
} = {
  [Influences.Assassin]: {
    legalAction: Actions.Assassinate
  },
  [Influences.Contessa]: {
    legalBlock: Actions.Assassinate
  },
  [Influences.Captain]: {
    legalAction: Actions.Steal,
    legalBlock: Actions.Steal
  },
  [Influences.Ambassador]: {
    legalAction: Actions.Exchange,
    legalBlock: Actions.Steal
  },
  [Influences.Duke]: {
    legalAction: Actions.Tax,
    legalBlock: Actions.ForeignAid
  }
}

export const ActionAttributes: {
  [action in Actions]: {
    blockable: boolean
    challengeable: boolean
    coinsRequired?: number
    influenceRequired?: Influences
    requiresTarget: boolean
  }
} = {
  [Actions.Assassinate]: {
    blockable: true,
    challengeable: true,
    coinsRequired: 3,
    influenceRequired: Influences.Assassin,
    requiresTarget: true
  },
  [Actions.Steal]: {
    blockable: true,
    challengeable: true,
    influenceRequired: Influences.Captain,
    requiresTarget: true
  },
  [Actions.Coup]: {
    blockable: false,
    challengeable: false,
    coinsRequired: 7,
    requiresTarget: true
  },
  [Actions.Tax]: {
    blockable: false,
    challengeable: true,
    influenceRequired: Influences.Duke,
    requiresTarget: false
  },
  [Actions.ForeignAid]: {
    blockable: true,
    challengeable: false,
    requiresTarget: false
  },
  [Actions.Income]: {
    blockable: false,
    challengeable: false,
    requiresTarget: false
  },
  [Actions.Exchange]: {
    blockable: false,
    challengeable: true,
    influenceRequired: Influences.Ambassador,
    requiresTarget: false
  }
}

export enum Responses {
  Pass = 'Pass',
  Challenge = 'Challenge',
  Block = 'Block'
}

export enum EventMessages {
  GameStarted = 'GameStarted',
  PlayerDied = 'PlayerDied',
  PlayerLostInfluence = 'PlayerLostInfluence',
  PlayerReplacedInfluence = 'PlayerReplacedInfluence',
  ActionConfirm = 'ActionConfirm',
  ActionPending = 'ActionPending',
  ActionProcessed = 'ActionProcessed',
  ChallengePending = 'ChallengePending',
  ChallengeSuccessful = 'ChallengeSuccessful',
  ChallengeFailed = 'ChallengeFailed',
  BlockPending = 'BlockPending',
  BlockSuccessful = 'BlockSuccessful',
  BlockFailed = 'BlockFailed'
}

export type EventMessage = {
  event: EventMessages
  action?: Actions
  primaryPlayer?: string
  secondaryPlayer?: string
  influence?: Influences
}

export type AiPersonality = {
  vengefulness: number
  honesty: number
  skepticism: number
}

export type Player = {
  coins: number
  color: string
  id: string
  influences: Influences[]
  claimedInfluences: Influences[]
  deadInfluences: Influences[]
  name: string
  ai: boolean
  personality?: AiPersonality
  grudges: {
    [playerName: string]: number
  }
}

export type PublicPlayer = Omit<Player, 'id' | 'influences'> & {
  influenceCount: number
}

export type GameState = {
  deck: Influences[]
  eventLogs: EventMessage[]
  lastEventTimestamp: Date
  isStarted: boolean
  availablePlayerColors: string[]
  players: Player[]
  pendingAction?: {
    targetPlayer?: string
    action: Actions
    pendingPlayers: string[]
    claimConfirmed: boolean
  }
  pendingActionChallenge?: {
    sourcePlayer: string
  }
  pendingBlock?: {
    sourcePlayer: string
    claimedInfluence: Influences
    pendingPlayers: string[]
  }
  pendingBlockChallenge?: {
    sourcePlayer: string
  }
  pendingInfluenceLoss: {
    [player: string]: {
      putBackInDeck: boolean
    }[]
  }
  roomId: string
  turnPlayer?: string
  turn: number
  resetGameRequest?: {
    player: string
  }
}

export type PublicGameState = Pick<GameState,
  'eventLogs' |
  'isStarted' |
  'lastEventTimestamp' |
  'pendingInfluenceLoss' |
  'roomId'
> & Partial<Pick<GameState,
  'pendingAction' |
  'pendingActionChallenge' |
  'pendingBlock' |
  'pendingBlockChallenge' |
  'resetGameRequest' |
  'turn' |
  'turnPlayer'
>> & {
  players: PublicPlayer[]
  selfPlayer?: Player
  deckCount: number
}
