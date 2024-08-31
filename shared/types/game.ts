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

export const InfluencesRules: {
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

export type Player = {
  influences: Influences[],
  coins: number
  name: string
  id: string
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

export type PublicGameState = Omit<GameState, 'players'> & {
  players: PublicPlayer[]
}
