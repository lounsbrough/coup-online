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

type ColorMode = 'light' | 'dark'

export const InfluenceAttributes: {
  [influence in Influences]: {
    legalAction?: Actions
    legalBlock?: Actions
    color: { [mode in ColorMode]: string }
  }
} = {
  [Influences.Assassin]: {
    legalAction: Actions.Assassinate,
    color: {
      light: '#7A0000',
      dark: '#B23535'
    }
  },
  [Influences.Contessa]: {
    legalBlock: Actions.Assassinate,
    color: {
      light: '#9B6000',
      dark: '#C38E3A'
    }
  },
  [Influences.Captain]: {
    legalAction: Actions.Steal,
    legalBlock: Actions.Steal,
    color: {
      light: '#00338A',
      dark: '#3868BA'
    }
  },
  [Influences.Ambassador]: {
    legalAction: Actions.Exchange,
    legalBlock: Actions.Steal,
    color: {
      light: '#3D6600',
      dark: '#78A831'
    }
  },
  [Influences.Duke]: {
    legalAction: Actions.Tax,
    legalBlock: Actions.ForeignAid,
    color: {
      light: '#73007B',
      dark: '#AA35B2'
    }
  }
}

export const ActionAttributes: {
  [action in Actions]: {
    blockable: boolean
    challengeable: boolean
    coinsRequired?: number
    color: { [mode in ColorMode]: string }
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
    color: {
      light: undefined,
      dark: undefined
    },
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
    color: {
      light: undefined,
      dark: undefined
    },
    requiresTarget: false
  },
  [Actions.Income]: {
    blockable: false,
    challengeable: false,
    color: {
      light: undefined,
      dark: undefined
    },
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
    color: { [mode in ColorMode]: string }
  }
} = {
  [Responses.Pass]: {
    color: {
      light: undefined,
      dark: undefined
    }
  },
  [Responses.Challenge]: {
    color: {
      light: undefined,
      dark: undefined
    }
  },
  [Responses.Block]: {
    color: {
      light: undefined,
      dark: undefined
    }
  }
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
