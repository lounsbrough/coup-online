import { Chance } from 'chance'
import { Actions, Influences, PublicGameState, PublicPlayer } from '../../../shared/types/game'
import { decideAction, getPlayerDangerFactor, getProbabilityOfPlayerInfluence } from './ai'

const chance = new Chance()

describe('ai', () => {
  const getRandomPlayer = (): PublicPlayer => ({
    name: chance.string(),
    coins: chance.natural(),
    influenceCount: 2,
    deadInfluences: [],
    color: chance.string(),
    ai: chance.bool()
  })

  describe('getProbabilityOfPlayerInfluence', () => {
    const testCases: {
      testCase: string
      gameState: PublicGameState,
      influence: Influences
      probability: number
    }[] = [
        {
          testCase: '2 hidden cards',
          gameState: {
            roomId: chance.string(),
            isStarted: chance.bool(),
            eventLogs: [],
            players: [
              {
                ...getRandomPlayer(),
                influenceCount: 1,
                deadInfluences: [Influences.Contessa]
              },
              {
                ...getRandomPlayer(),
                influenceCount: 1,
                deadInfluences: [Influences.Captain]
              }
            ],
            selfPlayer: {
              ...getRandomPlayer(),
              id: chance.string(),
              influences: [Influences.Ambassador],
              deadInfluences: [Influences.Contessa]
            },
            pendingInfluenceLoss: {},
            deckCount: 11
          },
          influence: Influences.Captain,
          probability: 2 / 12
        },
        {
          testCase: '2 cards revealed and self holding last card',
          gameState: {
            roomId: chance.string(),
            isStarted: chance.bool(),
            eventLogs: [],
            players: [
              {
                ...getRandomPlayer(),
                influenceCount: 1,
                deadInfluences: [Influences.Ambassador]
              },
              {
                ...getRandomPlayer(),
                influenceCount: 1,
                deadInfluences: [Influences.Assassin]
              },
              {
                ...getRandomPlayer(),
                influenceCount: 1,
                deadInfluences: [Influences.Assassin]
              }
            ],
            selfPlayer: {
              ...getRandomPlayer(),
              id: chance.string(),
              influences: [Influences.Assassin],
              deadInfluences: [Influences.Ambassador]
            },
            pendingInfluenceLoss: {},
            deckCount: 9
          },
          influence: Influences.Assassin,
          probability: 0
        },
        {
          testCase: 'self holding 2 cards and last card hidden',
          gameState: {
            roomId: chance.string(),
            isStarted: chance.bool(),
            eventLogs: [],
            players: [
              {
                ...getRandomPlayer(),
                influenceCount: 2,
                deadInfluences: []
              },
              {
                ...getRandomPlayer(),
                influenceCount: 2,
                deadInfluences: []
              },
            ],
            selfPlayer: {
              ...getRandomPlayer(),
              id: chance.string(),
              influences: [Influences.Duke, Influences.Duke],
              deadInfluences: []
            },
            pendingInfluenceLoss: {},
            deckCount: 11
          },
          influence: Influences.Duke,
          probability: 1 / 13
        },
        {
          testCase: 'all cards revealed for influence',
          gameState: {
            roomId: chance.string(),
            isStarted: chance.bool(),
            eventLogs: [],
            players: [
              {
                ...getRandomPlayer(),
                influenceCount: 1,
                deadInfluences: [Influences.Assassin]
              },
              {
                ...getRandomPlayer(),
                influenceCount: 1,
                deadInfluences: [Influences.Assassin]
              },
              {
                ...getRandomPlayer(),
                influenceCount: 1,
                deadInfluences: [Influences.Assassin]
              }
            ],
            selfPlayer: {
              ...getRandomPlayer(),
              id: chance.string(),
              influences: [Influences.Ambassador],
              deadInfluences: [Influences.Assassin]
            },
            pendingInfluenceLoss: {},
            deckCount: 9
          },
          influence: Influences.Assassin,
          probability: 0
        }
      ]

    it.each(testCases)('should return $probability for $testCase', ({
      probability,
      gameState,
      influence
    }: {
      testCase: string
      probability: number
      gameState: PublicGameState
      influence: Influences
    }) => {
      expect(getProbabilityOfPlayerInfluence(gameState, influence)).toBeCloseTo(probability)
    })
  })

  describe('getPlayerDangerFactor', () => {
    const testCases: {
      testCase: string
      player: PublicPlayer
      dangerFactor: number
    }[] = [
        {
          testCase: 'dead player with some coins',
          player: {
            ...getRandomPlayer(),
            influenceCount: 0,
            coins: 12
          },
          dangerFactor: 0
        },
        {
          testCase: '1 influence left with 0 coins',
          player: {
            ...getRandomPlayer(),
            influenceCount: 1,
            coins: 0
          },
          dangerFactor: 10
        },
        {
          testCase: '1 influence left with 12 coins',
          player: {
            ...getRandomPlayer(),
            influenceCount: 1,
            coins: 12
          },
          dangerFactor: 22
        },
        {
          testCase: '2 influences left with 0 coins',
          player: {
            ...getRandomPlayer(),
            influenceCount: 2,
            coins: 0
          },
          dangerFactor: 20
        },
        {
          testCase: '2 influences left with 12 coins',
          player: {
            ...getRandomPlayer(),
            influenceCount: 2,
            coins: 12
          },
          dangerFactor: 32
        }
      ]

    it.each(testCases)('should return $dangerFactor for $testCase', ({ player, dangerFactor }) => {
      expect(getPlayerDangerFactor(player)).toBeCloseTo(dangerFactor)
    })
  })

  describe('decideAction', () => {
    it('should choose Coup if 10 or more coins', () => {
      expect(decideAction({
        roomId: chance.string(),
        isStarted: chance.bool(),
        eventLogs: [],
        players: [
          {
            ...getRandomPlayer(),
            name: 'harper',
            influenceCount: 2,
            deadInfluences: []
          },
          {
            ...getRandomPlayer(),
            name: 'david',
            influenceCount: 2,
            deadInfluences: []
          }
        ],
        selfPlayer: {
          ...getRandomPlayer(),
          id: chance.string(),
          name: 'harper',
          coins: 10,
          influences: [Influences.Ambassador, Influences.Contessa],
          deadInfluences: []
        },
        pendingInfluenceLoss: {},
        deckCount: 11
      })).toEqual({
        action: Actions.Coup,
        targetPlayer: 'david'
      })
    })

    it('should choose Coup if 7 or more coins and checkmate', () => {
      expect(decideAction({
        roomId: chance.string(),
        isStarted: chance.bool(),
        eventLogs: [],
        players: [
          {
            ...getRandomPlayer(),
            name: 'harper',
            influenceCount: 1,
            deadInfluences: [Influences.Contessa]
          },
          {
            ...getRandomPlayer(),
            name: 'david',
            influenceCount: 1,
            deadInfluences: [Influences.Captain]
          }
        ],
        selfPlayer: {
          ...getRandomPlayer(),
          id: chance.string(),
          name: 'harper',
          coins: 7,
          influences: [Influences.Ambassador],
          deadInfluences: [Influences.Contessa]
        },
        pendingInfluenceLoss: {},
        deckCount: 11
      })).toEqual({
        action: Actions.Coup,
        targetPlayer: 'david'
      })
    })
  })
})
