import Chance from 'chance'
import { Player, PublicGameState, PublicPlayer } from '../../../shared/types/game'
import { createGameHandler, getGameStateHandler } from './actionHandlers'
import { getValue, setValue } from '../utilities/storage'
import { getPublicGameState } from '../utilities/gameState'

jest.mock('../utilities/storage')

const getValueMock = jest.mocked(getValue)
const setValueMock = jest.mocked(setValue)

const inMemoryStorage: {
  [key: string]: string
} = {}

getValueMock.mockImplementation((key: string) =>
  Promise.resolve(inMemoryStorage[key]))

setValueMock.mockImplementation((key: string, value: string) => {
  inMemoryStorage[key] = value
  return Promise.resolve()
})

const chance = new Chance()

const validatePublicState = (gameState: PublicGameState) => {
  expect(gameState.selfPlayer).toBeTruthy()
  gameState.players.forEach((player: Player & PublicPlayer) => {
    expect(player.id).toBeUndefined()
    expect(player.influences).toBeUndefined()
    expect(player.influenceCount).toBeTruthy()
    expect(player.name).toBeTruthy()
    expect(player.coins).toBeTruthy()
    expect(player.color).toBeTruthy()
  })
}

describe('actionHandlers', () => {
  describe('getGameState', () => {
    it.each([
      {
        handler: async () => {
          const playerId = chance.string({ length: 10 })
          const playerName = chance.string({ length: 10 })

          const gameState = await createGameHandler({ playerId, playerName })

          return getGameStateHandler({ roomId: gameState.roomId, playerId })
        },
        error: ''
      },
      {
        handler: () => {
          const roomId = chance.string({ length: 10 })
          const playerId = chance.string({ length: 10 })

          return getGameStateHandler({ roomId, playerId })
        },
        error: /Room .+ does not exist/
      },
      {
        handler: async () => {
          const playerId = chance.string({ length: 10 })
          const playerName = chance.string({ length: 10 })

          const gameState = await createGameHandler({ playerId, playerName })

          return getGameStateHandler({ roomId: gameState.roomId, playerId: chance.string({ length: 10 }) })
        },
        error: 'Player not in game'
      }
    ] as {
      handler: () => Promise<{ roomId: string, playerId: string }>,
      error: string
    }[])('should return $status $error', async ({ handler, error }) => {
      if (error) {
        await expect(handler()).rejects.toThrow()
      } else {
        validatePublicState(await getPublicGameState(await handler()))
      }
    })
  })
})
