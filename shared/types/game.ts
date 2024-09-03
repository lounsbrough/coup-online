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
    color: string
  }
} = {
  [Influences.Assassin]: {
    legalAction: Actions.Assassinate,
    color: '#555555'
  },
  [Influences.Contessa]: {
    legalBlock: Actions.Assassinate,
    color: '#E35646'
  },
  [Influences.Captain]: {
    legalAction: Actions.Steal,
    legalBlock: Actions.Steal,
    color: '#80C6E5'
  },
  [Influences.Ambassador]: {
    legalAction: Actions.Exchange,
    legalBlock: Actions.Steal,
    color: '#B4CA1F'
  },
  [Influences.Duke]: {
    legalAction: Actions.Tax,
    legalBlock: Actions.ForeignAid,
    color: '#D55DC7'
  }
}

export const ActionAttributes: {
  [action in Actions]: {
    blockable: boolean
    challengeable: boolean
    coinsRequired?: number
    color: string
    requiresTarget: boolean
  }
} = {
  [Actions.Assassinate]: {
    blockable: true,
    challengeable: true,
    coinsRequired: 3,
    color: InfluenceAttributes.Assassin.color,
    requiresTarget: true
  },
  [Actions.Steal]: {
    blockable: true,
    challengeable: true,
    color: InfluenceAttributes.Captain.color,
    requiresTarget: true
  },
  [Actions.Coup]: {
    blockable: false,
    challengeable: false,
    coinsRequired: 7,
    color: '#770077',
    requiresTarget: true
  },
  [Actions.Tax]: {
    blockable: false,
    challengeable: true,
    color: InfluenceAttributes.Duke.color,
    requiresTarget: false
  },
  [Actions.ForeignAid]: {
    blockable: true,
    challengeable: false,
    color: '#555555',
    requiresTarget: false
  },
  [Actions.Income]: {
    blockable: false,
    challengeable: false,
    color: '#555555',
    requiresTarget: false
  },
  [Actions.Exchange]: {
    blockable: false,
    challengeable: true,
    color: InfluenceAttributes.Ambassador.color,
    requiresTarget: false
  }
}

export enum Responses {
  Pass = 'Pass',
  Challenge = 'Challenge',
  Block = 'Block'
}

export const ResponseAttributes: {
  [response in Responses]: {
    color: string
  }
} = {
  [Responses.Pass]: { color: '#007700' },
  [Responses.Challenge]: { color: '#ff7700' },
  [Responses.Block]: { color: '#770000' }
}

export type Player = {
  influences: Influences[],
  coins: number
  name: string
  id: string
  color: string
}

export type PublicPlayer = Omit<Player, 'id' | 'influences'> & {
  influenceCount: number
};

export type GameState = {
  players: Player[]
  deck: Influences[]
  turnPlayer?: string
  pendingAction?: {
    targetPlayer?: string
    action: Actions
    pendingPlayers: string[]
  }
  pendingActionChallenge?: {
    sourcePlayer: string
  }
  pendingBlock?: {
    sourcePlayer: string
    claimedInfluence: Influences
  }
  pendingBlockChallenge?: {
    sourcePlayer: string
  }
  pendingInfluenceLossCount: {
    [player: string]: number
  }
  isStarted: boolean
  eventLogs: string[]
}

export type PublicGameState = Pick<GameState,
  'turnPlayer' |
  'pendingAction' |
  'pendingActionChallenge' |
  'pendingBlock' |
  'pendingBlockChallenge' |
  'pendingInfluenceLossCount' |
  'isStarted' |
  'eventLogs'
> & {
  players: PublicPlayer[]
  selfPlayer: Player
}
