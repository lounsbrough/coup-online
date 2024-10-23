import { Chance } from 'chance'
import { Influences, PublicGameState, PublicPlayer } from '../../../shared/types/game'
import { getProbabilityOfPlayerInfluence } from './ai'

const chance = new Chance()

describe('ai', () => {
  describe('getProbabilityOfPlayerInfluence', () => {
    const getRandomPlayer = (): PublicPlayer => ({
      name: chance.string(),
      coins: chance.natural(),
      influenceCount: 2,
      deadInfluences: [],
      color: chance.string(),
      ai: chance.bool()
    })

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
            isStarted: true,
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
              id: chance.string(),
              ...getRandomPlayer(),
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
            isStarted: true,
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
              id: chance.string(),
              ...getRandomPlayer(),
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
            isStarted: true,
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
              id: chance.string(),
              ...getRandomPlayer(),
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
            isStarted: true,
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
              id: chance.string(),
              ...getRandomPlayer(),
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
})
