import { Chance } from "chance"
import { getGameState, getPublicGameState } from "./gameState"
import { Actions, Influences } from '../../shared/types/game'
import { getValue } from "./storage"

jest.mock("./storage")
const getValueMock = jest.mocked(getValue)

const chance = new Chance()

const getRandomGameState = () => ({
  deadCards: [Influences.Ambassador],
  deck: chance.n(() => chance.pickone(Object.values(Influences)), chance.natural({ min: 1, max: 5 })),
  eventLogs: chance.n(chance.string, chance.natural({ min: 2, max: 10 })),
  isStarted: chance.bool(),
  players: chance.n(() => ({
    id: chance.string(),
    name: chance.string(),
    color: chance.color(),
    coins: chance.natural({ min: 0, max: 12 }),
    influences: chance.n(() => chance.pickone(Object.values(Influences)), chance.natural({ min: 1, max: 2 }))
  }), chance.natural({ min: 2, max: 6 })),
  pendingAction: {
    action: chance.pickone(Object.values(Actions)),
    pendingPlayers: chance.n(chance.string, chance.natural({ min: 1, max: 5 })),
    claimConfirmed: chance.bool()
  },
  pendingActionChallenge: {
    sourcePlayer: chance.string()
  },
  pendingBlock: {
    sourcePlayer: chance.string(),
    pendingPlayers: chance.n(chance.string, chance.natural({ min: 1, max: 5 })),
    claimedInfluence: chance.pickone(Object.values(Actions))
  },
  pendingBlockChallenge: {
    sourcePlayer: chance.string()
  },
  pendingInfluenceLoss: {
    [chance.string()]: [{ putBackInDeck: chance.bool() }]
  },
  roomId: chance.string(),
  turnPlayer: chance.string()
})

describe('gameState', () => {
  describe('getGameState', () => {
    it('should get game state object from storage by room id key', async () => {
      const expectedRoomId = 'some room'
      const expectedGameState = getRandomGameState()
      getValueMock.mockResolvedValue(JSON.stringify(expectedGameState))

      const gameState = await getGameState(expectedRoomId)

      expect(gameState).toEqual(expectedGameState)
      expect(getValueMock).toHaveBeenCalledTimes(1)
      expect(getValueMock).toHaveBeenCalledWith(expectedRoomId)
    })
  })

  describe('getPublicGameState', () => {
    it('should get portion of game state that is accessible to player', async () => {
      const expectedGameState = getRandomGameState()
      const expectedPlayer = chance.pickone(expectedGameState.players)
      getValueMock.mockResolvedValue(JSON.stringify(expectedGameState))

      const expectedPublicGameState = {
        ...expectedGameState,
        selfPlayer: {
          id: expectedPlayer.id,
          name: expectedPlayer.name,
          color: expectedPlayer.color,
          coins: expectedPlayer.coins,
          influences: expectedPlayer.influences
        },
        players: expectedGameState.players.map((player) => ({
          name: player.name,
          color: player.color,
          coins: player.coins,
          influenceCount: player.influences.length
        }))
      }
      delete expectedPublicGameState.deck

      expect(await getPublicGameState(expectedGameState.roomId, expectedPlayer.id))
        .toStrictEqual(expectedPublicGameState)
    })
  })
})
