export enum Actions {
  Assassinate = 'Assassinate',
  Steal = 'Steal',
  Coup = 'Coup',
  Tax = 'Tax',
  ForeignAid = 'ForeignAid',
  Income = 'Income',
  Exchange = 'Exchange'
}

export const ActionRules: {
  [action in Actions]: {
    blockable: boolean
    challengeable: boolean
    coinsRequired?: number
  }
} = {
  [Actions.Assassinate]: {
    blockable: true,
    challengeable: true,
    coinsRequired: 3
  },
  [Actions.Steal]: {
    blockable: true,
    challengeable: true
  },
  [Actions.Coup]: {
    blockable: false,
    challengeable: false,
    coinsRequired: 7
  },
  [Actions.Tax]: {
    blockable: false,
    challengeable: true
  },
  [Actions.ForeignAid]: {
    blockable: true,
    challengeable: false
  },
  [Actions.Income]: {
    blockable: false,
    challengeable: false
  },
  [Actions.Exchange]: {
    blockable: false,
    challengeable: true
  }
}

export enum Influences {
  Assassin = 'Assassin',
  Contessa = 'Contessa',
  Captain = 'Captain',
  Ambassador = 'Ambassador',
  Duke = 'Duke'
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
    color: '#2B2B2B'
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

type CardDeck = {
  cards: Influences[],
  getNextCard: () => Influences
}

export type GameState = {
  players: Player[]
  deck: CardDeck
  turnPlayer?: string
  pendingAction?: {
    targetPlayer?: string
    action: Actions
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
  isStarted: boolean
}

export type PublicGameState = Pick<GameState,
  'turnPlayer' |
  'pendingAction' |
  'pendingActionChallenge' |
  'pendingBlock' |
  'pendingBlockChallenge' |
  'isStarted'
> & {
  players: PublicPlayer[]
  selfPlayer: Player
}
