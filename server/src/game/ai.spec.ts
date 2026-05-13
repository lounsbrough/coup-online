import { vi, describe, it, expect } from 'vitest'
import { Chance } from 'chance'
import {
  Actions,
  Influences,
  Player,
  PublicGameState,
  PublicPlayer,
  Responses,
} from '../../../shared/types/game'
import {
  decideAction,
  decideActionResponse,
  decideBlockResponse,
  getOpponents,
  getPlayerDangerFactor,
  getProbabilityOfPlayerInfluence,
} from './ai'
import { randomlyDecideToBluff } from './aiRandomness'

const chance = new Chance()
vi.mock('./aiRandomness')

const randomlyDecideToBluffMock = vi.mocked(randomlyDecideToBluff)

describe('ai', () => {
  const getRandomPlayer = (): Player => ({
    id: chance.guid(),
    name: chance.string(),
    coins: chance.natural({ min: 0, max: 5 }),
    influences: [],
    claimedInfluences: new Set(),
    unclaimedInfluences: new Set(),
    deadInfluences: [],
    color: chance.string(),
    ai: chance.bool(),
    grudges: {},
  })

  const getRandomPublicPlayer = (): PublicPlayer => ({
    name: chance.string(),
    coins: chance.natural({ min: 0, max: 5 }),
    influenceCount: 2,
    claimedInfluences: new Set(),
    unclaimedInfluences: new Set(),
    deadInfluences: [],
    color: chance.string(),
    ai: chance.bool(),
    grudges: {},
  })

  const getRandomPublicGameState = ({
    players,
    selfPlayer,
  }: {
    players: Partial<PublicPlayer>[];
    selfPlayer: Partial<Player>;
  }): PublicGameState => {
    const gameState: PublicGameState = {
      deckCount: 15 - players.length * 2,
      eventLogs: [],
      chatMessages: [],
      lastEventTimestamp: chance.date(),
      isStarted: chance.bool(),
      turn: chance.natural(),
      players: [],
      pendingInfluenceLoss: {},
      settings: { eventLogRetentionTurns: 3, allowRevive: true },
      roomId: chance.string(),
    }

    gameState.players = players.map((player) => {
      return {
        ...getRandomPublicPlayer(),
        ...player,
      }
    })
    gameState.selfPlayer = {
      ...getRandomPlayer(),
      ...selfPlayer,
    }
    gameState.turnPlayer = gameState.selfPlayer.name

    return gameState
  }

  describe('getProbabilityOfPlayerInfluence', () => {
    const testCases: {
      testCase: string;
      gameState: PublicGameState;
      influence: Influences;
      playerName: string;
      probability: number;
      anyPlayerProbability: number;
    }[] = [
      {
        testCase: '2 hidden cards',
        gameState: getRandomPublicGameState({
          players: [
            {
              name: 'david',
              influenceCount: 1,
              deadInfluences: [Influences.Contessa],
            },
            {
              name: 'harper',
              influenceCount: 1,
              deadInfluences: [Influences.Captain],
            },
          ],
          selfPlayer: {
            name: 'david',
            influences: [Influences.Ambassador],
            deadInfluences: [Influences.Contessa],
          },
        }),
        influence: Influences.Captain,
        playerName: 'harper',
        probability: 2 / 12,
        anyPlayerProbability: 2 / 12,
      },
      {
        testCase: '2 cards revealed and self holding last card',
        gameState: getRandomPublicGameState({
          players: [
            {
              name: 'david',
              influenceCount: 1,
              deadInfluences: [Influences.Ambassador],
            },
            {
              name: 'harper',
              influenceCount: 1,
              deadInfluences: [Influences.Assassin],
            },
            {
              name: 'hailey',
              influenceCount: 1,
              deadInfluences: [Influences.Assassin],
            },
          ],
          selfPlayer: {
            name: 'david',
            influences: [Influences.Assassin],
            deadInfluences: [Influences.Ambassador],
          },
        }),
        influence: Influences.Assassin,
        playerName: 'hailey',
        probability: 0,
        anyPlayerProbability: 0,
      },
      {
        testCase: 'self holding 2 cards and last card hidden',
        gameState: getRandomPublicGameState({
          players: [
            { name: 'david', influenceCount: 2, deadInfluences: [] },
            { name: 'harper', influenceCount: 2, deadInfluences: [] },
            { name: 'hailey', influenceCount: 2, deadInfluences: [] },
          ],
          selfPlayer: {
            name: 'david',
            influences: [Influences.Duke, Influences.Duke],
            deadInfluences: [],
          },
        }),
        influence: Influences.Duke,
        playerName: 'harper',
        probability: 2 / 13,
        anyPlayerProbability: 4 / 13,
      },
      {
        testCase: 'all cards revealed for influence',
        gameState: getRandomPublicGameState({
          players: [
            {
              name: 'david',
              influenceCount: 1,
              deadInfluences: [Influences.Assassin],
            },
            {
              name: 'harper',
              influenceCount: 1,
              deadInfluences: [Influences.Assassin],
            },
            {
              name: 'hailey',
              influenceCount: 1,
              deadInfluences: [Influences.Assassin],
            },
          ],
          selfPlayer: {
            name: 'david',
            influences: [Influences.Ambassador],
            deadInfluences: [Influences.Assassin],
          },
        }),
        influence: Influences.Assassin,
        playerName: 'harper',
        probability: 0,
        anyPlayerProbability: 0,
      },
    ]

    it.each(testCases)(
      'should return $probability for $testCase',
      ({
        gameState,
        influence,
        playerName,
        probability,
        anyPlayerProbability,
      }: {
        testCase: string;
        gameState: PublicGameState;
        influence: Influences;
        playerName: string;
        probability: number;
        anyPlayerProbability: number;
      }) => {
        expect(
          getProbabilityOfPlayerInfluence(gameState, influence, playerName),
        ).toBeCloseTo(probability)
        expect(
          getProbabilityOfPlayerInfluence(gameState, influence),
        ).toBeCloseTo(anyPlayerProbability)
      },
    )
  })

  describe('getPlayerDangerFactor', () => {
    const testCases: {
      testCase: string;
      player: PublicPlayer;
      dangerFactor: number;
    }[] = [
      {
        testCase: 'dead player with some coins',
        player: {
          ...getRandomPublicPlayer(),
          influenceCount: 0,
          coins: 12,
        },
        dangerFactor: 0,
      },
      {
        testCase: '1 influence left with 0 coins',
        player: {
          ...getRandomPublicPlayer(),
          influenceCount: 1,
          coins: 0,
        },
        dangerFactor: 10,
      },
      {
        testCase: '1 influence left with 12 coins',
        player: {
          ...getRandomPublicPlayer(),
          influenceCount: 1,
          coins: 12,
        },
        dangerFactor: 22,
      },
      {
        testCase: '2 influences left with 0 coins',
        player: {
          ...getRandomPublicPlayer(),
          influenceCount: 2,
          coins: 0,
        },
        dangerFactor: 20,
      },
      {
        testCase: '2 influences left with 12 coins',
        player: {
          ...getRandomPublicPlayer(),
          influenceCount: 2,
          coins: 12,
        },
        dangerFactor: 32,
      },
    ]

    it.each(testCases)(
      'should return $dangerFactor for $testCase',
      ({ player, dangerFactor }) => {
        expect(getPlayerDangerFactor(player)).toBeCloseTo(dangerFactor)
      },
    )
  })

  describe('getOpponents', () => {
    it.each([
      {
        testCase: '1 living opponent, 1 dead opponent',
        gameState: getRandomPublicGameState({
          players: [
            { name: 'david', influenceCount: 1 },
            { name: 'harper', influenceCount: 0 },
            { name: 'hailey', influenceCount: 1 },
          ],
          selfPlayer: { name: 'david' },
        }),
        expected: [expect.objectContaining({ name: 'hailey' })],
      },
      {
        testCase: '1 dead opponent',
        gameState: getRandomPublicGameState({
          players: [
            { name: 'david', influenceCount: 1 },
            { name: 'harper', influenceCount: 0 },
          ],
          selfPlayer: { name: 'david' },
        }),
        expected: [],
      },
      {
        testCase: '2 living opponents',
        gameState: getRandomPublicGameState({
          players: [
            { name: 'david', influenceCount: 1 },
            { name: 'harper', influenceCount: 1 },
            { name: 'hailey', influenceCount: 1 },
          ],
          selfPlayer: { name: 'david' },
        }),
        expected: [
          expect.objectContaining({ name: 'harper' }),
          expect.objectContaining({ name: 'hailey' }),
        ],
      },
    ])('should return $expected for $testCase', ({ gameState, expected }) => {
      expect(getOpponents(gameState)).toEqual(expected)
    })
  })

  describe('decideAction', () => {
    it('should choose Coup if 10 or more coins and Revive not enabled', () => {
      expect(
        decideAction({
          roomId: chance.string(),
          isStarted: chance.bool(),
          turn: chance.natural(),
          eventLogs: [],
          chatMessages: [],
          lastEventTimestamp: chance.date(),
          players: [
            {
              ...getRandomPublicPlayer(),
              name: 'harper',
              influenceCount: 2,
              deadInfluences: [],
            },
            {
              ...getRandomPublicPlayer(),
              name: 'david',
              influenceCount: 2,
              deadInfluences: [],
            },
          ],
          selfPlayer: {
            ...getRandomPublicPlayer(),
            id: chance.string(),
            name: 'harper',
            coins: 10,
            influences: [Influences.Ambassador, Influences.Contessa],
            deadInfluences: [],
          },
          settings: { eventLogRetentionTurns: 3, allowRevive: false },
          pendingInfluenceLoss: {},
          deckCount: 11,
        }),
      ).toEqual({
        action: Actions.Coup,
        targetPlayer: 'david',
      })
    })

    it('should choose Coup if 7 or more coins and checkmate', () => {
      expect(
        decideAction({
          roomId: chance.string(),
          isStarted: chance.bool(),
          turn: chance.natural(),
          eventLogs: [],
          chatMessages: [],
          lastEventTimestamp: chance.date(),
          players: [
            {
              ...getRandomPublicPlayer(),
              name: 'harper',
              influenceCount: 1,
              deadInfluences: [Influences.Contessa],
            },
            {
              ...getRandomPublicPlayer(),
              name: 'david',
              influenceCount: 1,
              deadInfluences: [Influences.Captain],
            },
          ],
          selfPlayer: {
            ...getRandomPublicPlayer(),
            id: chance.string(),
            name: 'harper',
            coins: 7,
            influences: [Influences.Ambassador],
            deadInfluences: [Influences.Contessa],
          },
          settings: { eventLogRetentionTurns: 3, allowRevive: true },
          pendingInfluenceLoss: {},
          deckCount: 11,
        }),
      ).toEqual({
        action: Actions.Coup,
        targetPlayer: 'david',
      })
    })

    it('should bluff influence on actions with some randomness', () => {
      randomlyDecideToBluffMock.mockReturnValue(true)

      const decidedAction = decideAction({
        roomId: chance.string(),
        isStarted: chance.bool(),
        turn: chance.natural(),
        eventLogs: [],
        chatMessages: [],
        lastEventTimestamp: chance.date(),
        players: [
          {
            ...getRandomPublicPlayer(),
            name: 'harper',
            influenceCount: 1,
            deadInfluences: [Influences.Assassin],
            claimedInfluences: new Set([Influences.Duke]),
          },
          {
            ...getRandomPublicPlayer(),
            name: 'hailey',
            influenceCount: 1,
            deadInfluences: [Influences.Duke],
          },
          {
            ...getRandomPublicPlayer(),
            name: 'david',
            influenceCount: 1,
            deadInfluences: [Influences.Duke],
          },
        ],
        selfPlayer: {
          ...getRandomPublicPlayer(),
          id: chance.string(),
          name: 'harper',
          coins: 4,
          influences: [Influences.Ambassador],
          deadInfluences: [Influences.Assassin],
          claimedInfluences: new Set([Influences.Duke]),
        },
        settings: { eventLogRetentionTurns: 3, allowRevive: false },
        pendingInfluenceLoss: {},
        deckCount: 11,
      })

      expect(decidedAction.action).toBe(Actions.Tax)
    })

    it('should not bluff influence if all are dead', () => {
      randomlyDecideToBluffMock.mockReturnValue(true)

      const decidedAction = decideAction({
        roomId: chance.string(),
        isStarted: chance.bool(),
        turn: chance.natural(),
        eventLogs: [],
        chatMessages: [],
        lastEventTimestamp: chance.date(),
        players: [
          {
            ...getRandomPublicPlayer(),
            name: 'harper',
            influenceCount: 1,
            deadInfluences: [Influences.Assassin],
            claimedInfluences: new Set([Influences.Duke]),
          },
          {
            ...getRandomPublicPlayer(),
            name: 'hailey',
            influenceCount: 1,
            deadInfluences: [Influences.Duke],
          },
          {
            ...getRandomPublicPlayer(),
            name: 'david',
            influenceCount: 0,
            deadInfluences: [Influences.Duke, Influences.Duke],
          },
        ],
        selfPlayer: {
          ...getRandomPublicPlayer(),
          id: chance.string(),
          name: 'harper',
          coins: 4,
          influences: [Influences.Ambassador],
          deadInfluences: [Influences.Assassin],
          claimedInfluences: new Set([Influences.Duke]),
        },
        settings: { eventLogRetentionTurns: 3, allowRevive: true },
        pendingInfluenceLoss: {},
        deckCount: 11,
      })

      expect(decidedAction.action).not.toBe(Actions.Tax)
    })

    it('should choose Coup when 10 coins, 1 influence left, and last opponent has 7+ coins', () => {
      // Mandatory Coup must override the steal/assassinate endgame logic
      expect(
        decideAction(
          getRandomPublicGameState({
            players: [
              {
                name: 'bot',
                influenceCount: 1,
                coins: 10,
                deadInfluences: [Influences.Duke],
              },
              {
                name: 'opponent',
                influenceCount: 2,
                coins: 7,
                deadInfluences: [],
              },
            ],
            selfPlayer: {
              name: 'bot',
              coins: 10,
              influences: [Influences.Contessa],
              deadInfluences: [Influences.Duke],
            },
          })
        )
      ).toEqual({ action: Actions.Coup, targetPlayer: 'opponent' })
    })

    it('should choose Steal or Assassinate when one influence left against last 7+ coin opponent', () => {
      const decidedAction = decideAction(
        getRandomPublicGameState({
          players: [
            {
              name: 'bot',
              influenceCount: 1,
              coins: 4,
              deadInfluences: [Influences.Duke],
            },
            {
              name: 'opponent',
              influenceCount: 2,
              coins: 7,
              deadInfluences: [],
            },
          ],
          selfPlayer: {
            name: 'bot',
            coins: 4,
            influences: [Influences.Contessa],
            deadInfluences: [Influences.Duke],
          },
        })
      )

      expect([Actions.Steal, Actions.Assassinate]).toContain(decidedAction.action)
      expect(decidedAction.targetPlayer).toBe('opponent')
    })

    it('should choose Steal with fewer than 3 coins when one influence left against last 7+ coin opponent', () => {
      expect(
        decideAction(
          getRandomPublicGameState({
            players: [
              {
                name: 'bot',
                influenceCount: 1,
                coins: 2,
                deadInfluences: [Influences.Duke],
              },
              {
                name: 'opponent',
                influenceCount: 2,
                coins: 7,
                deadInfluences: [],
              },
            ],
            selfPlayer: {
              name: 'bot',
              coins: 2,
              influences: [Influences.Contessa],
              deadInfluences: [Influences.Duke],
            },
          })
        )
      ).toEqual({ action: Actions.Steal, targetPlayer: 'opponent' })
    })
  })

  describe('decideBlockResponse', () => {
    it('should challenge any block when one influence left against last 7+ coin opponent', () => {
      expect(
        decideBlockResponse(
          getRandomPublicGameState({
            players: [
              {
                name: 'bot',
                influenceCount: 1,
                coins: 2,
                deadInfluences: [Influences.Duke],
              },
              {
                name: 'opponent',
                influenceCount: 2,
                coins: 7,
                deadInfluences: [],
              },
            ],
            selfPlayer: {
              name: 'bot',
              coins: 2,
              influences: [Influences.Contessa],
              deadInfluences: [Influences.Duke],
            },
          })
        )
      ).toEqual({ response: Responses.Challenge })
    })
  })

  describe('decideActionResponse', () => {
    it('should not block when player holds or claims last influence, challenge makes more sense', () => {
      expect(
        decideActionResponse({
          roomId: chance.string(),
          isStarted: chance.bool(),
          turn: chance.natural(),
          eventLogs: [],
          chatMessages: [],
          lastEventTimestamp: chance.date(),
          players: [
            {
              ...getRandomPublicPlayer(),
              name: 'hailey',
              influenceCount: 2,
              deadInfluences: [],
            },
            {
              ...getRandomPublicPlayer(),
              name: 'harper',
              influenceCount: 0,
              deadInfluences: [Influences.Captain, Influences.Captain],
            },
            {
              ...getRandomPublicPlayer(),
              name: 'david',
              influenceCount: 2,
              deadInfluences: [],
            },
          ],
          selfPlayer: {
            ...getRandomPublicPlayer(),
            id: chance.string(),
            name: 'david',
            coins: 3,
            influences: [Influences.Captain, Influences.Contessa],
            deadInfluences: [],
          },
          pendingAction: {
            action: Actions.Steal,
            targetPlayer: 'david',
            claimConfirmed: false,
            pendingPlayers: new Set(['david']),
          },
          turnPlayer: 'hailey',
          settings: { eventLogRetentionTurns: 3, allowRevive: true },
          pendingInfluenceLoss: {},
          deckCount: 11,
        }),
      ).toEqual({ response: Responses.Challenge })
    })

    it('should block as Contessa when claimConfirmed is true and desperate', () => {
      randomlyDecideToBluffMock.mockReturnValue(false)

      expect(
        decideActionResponse({
          roomId: chance.string(),
          isStarted: chance.bool(),
          turn: chance.natural(),
          eventLogs: [],
          chatMessages: [],
          lastEventTimestamp: chance.date(),
          players: [
            {
              ...getRandomPublicPlayer(),
              name: 'hailey',
              influenceCount: 2,
              deadInfluences: [],
            },
            {
              ...getRandomPublicPlayer(),
              name: 'david',
              influenceCount: 1,
              deadInfluences: [Influences.Assassin],
            },
          ],
          selfPlayer: {
            ...getRandomPublicPlayer(),
            id: chance.string(),
            name: 'david',
            coins: 0,
            influences: [Influences.Ambassador],
            deadInfluences: [Influences.Assassin],
          },
          pendingAction: {
            action: Actions.Assassinate,
            targetPlayer: 'david',
            claimConfirmed: true,
            pendingPlayers: new Set(['david']),
          },
          turnPlayer: 'hailey',
          settings: { eventLogRetentionTurns: 3, allowRevive: true },
          pendingInfluenceLoss: {},
          deckCount: 11,
        })
      ).toEqual({ response: Responses.Block, claimedInfluence: Influences.Contessa })
    })
  })
})
