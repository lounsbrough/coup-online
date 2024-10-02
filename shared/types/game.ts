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
    requiresTarget: boolean
  }
} = {
  [Actions.Assassinate]: {
    blockable: true,
    challengeable: true,
    coinsRequired: 3,
    requiresTarget: true
  },
  [Actions.Steal]: {
    blockable: true,
    challengeable: true,
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
    requiresTarget: false
  }
}

export enum Responses {
  Pass = 'Pass',
  Challenge = 'Challenge',
  Block = 'Block'
}

export type Player = {
  coins: number
  color: string
  id: string
  influences: Influences[]
  deadInfluences: Influences[]
  name: string
}

export type PublicPlayer = Omit<Player, 'id' | 'influences'> & {
  influenceCount: number
}

export type GameState = {
  deck: Influences[]
  eventLogs: string[]
  isStarted: boolean
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
}

export type PublicGameState = Pick<GameState,
  'eventLogs' |
  'isStarted' |
  'pendingAction' |
  'pendingActionChallenge' |
  'pendingBlock' |
  'pendingBlockChallenge' |
  'pendingInfluenceLoss' |
  'roomId' |
  'turnPlayer'
> & {
  players: PublicPlayer[]
  selfPlayer: Player
}
