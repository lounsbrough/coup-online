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

type ColorMode = 'light' | 'dark';

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
      light: '#777777',
      dark: '#777777'
    }
  },
  [Influences.Contessa]: {
    legalBlock: Actions.Assassinate,
    color: {
      light: '#E35646',
      dark: '#E35646'
    }
  },
  [Influences.Captain]: {
    legalAction: Actions.Steal,
    legalBlock: Actions.Steal,
    color: {
      light: '#80C6E5',
      dark: '#80C6E5'
    }
  },
  [Influences.Ambassador]: {
    legalAction: Actions.Exchange,
    legalBlock: Actions.Steal,
    color: {
      light: '#B4CA1F',
      dark: '#B4CA1F'
    }
  },
  [Influences.Duke]: {
    legalAction: Actions.Tax,
    legalBlock: Actions.ForeignAid,
    color: {
      light: '#D55DC7',
      dark: '#D55DC7'
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
      light: '#770077',
      dark: '#770077'
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
      light: '#33aa33',
      dark: '#33aa33'
    },
    requiresTarget: false
  },
  [Actions.Income]: {
    blockable: false,
    challengeable: false,
    color: {
      light: '#ffa900',
      dark: '#ffa900'
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
      light: '#007700',
      dark: '#77ee77'
    }
  },
  [Responses.Challenge]: {
    color: {
      light: '#ff7700',
      dark: '#ffaa55'
    }
  },
  [Responses.Block]: {
    color: {
      light: '#770000',
      dark: '#ff6666'
    }
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

export type GameState = {
  roomId: string
  players: Player[]
  deck: Influences[]
  turnPlayer?: string
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
  isStarted: boolean
  eventLogs: string[]
}

export type PublicGameState = Pick<GameState,
  'roomId' |
  'turnPlayer' |
  'pendingAction' |
  'pendingActionChallenge' |
  'pendingBlock' |
  'pendingBlockChallenge' |
  'pendingInfluenceLoss' |
  'isStarted' |
  'eventLogs'
> & {
  players: PublicPlayer[]
  selfPlayer: Player
}
