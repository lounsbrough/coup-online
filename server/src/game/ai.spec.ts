import { Influences, PublicGameState } from '../../../shared/types/game'
import { getProbabilityOfPlayerInfluence } from './ai'

describe('ai', () => {
  describe('getProbabilityOfPlayerInfluence', () => {
    const testCases = [
      {
        testCase: 'all cards revealed for influence',
        gameState: {
          roomId: '123',
          isStarted: true,
          eventLogs: [],
          players: [
            {
              name: 'david',
              id: 'david',
              coins: 3,
              influenceCount: 1,
              deadInfluences: [Influences.Contessa],
              color: 'red',
              ai: false
            }
          ],
          selfPlayer: {
            name: 'david',
            id: 'david',
            coins: 3,
            influences: [Influences.Ambassador],
            deadInfluences: [Influences.Contessa],
            color: 'red',
            ai: false
          },
          pendingInfluenceLoss: {},
          deckCount: 1
        },
        playerName: 'david',
        influence: Influences.Captain,
        probability: 0
      }
    ]
    it.each(testCases)('should return $probability for $testCase', ({
      probability,
      gameState,
      playerName,
      influence
    }: {
      testCase: string
      probability: number
      gameState: PublicGameState
      playerName: string
      influence: Influences
    }) => {
      expect(getProbabilityOfPlayerInfluence(gameState, playerName, influence)).toBeCloseTo(probability)
    })
  })
})
