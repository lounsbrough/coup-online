import Chance from 'chance'
import { Actions, Influences, Responses } from '../../../shared/types/game'
import { actionChallengeResponseHandler, actionHandler, actionResponseHandler, blockChallengeResponseHandler, blockResponseHandler, createGameHandler, joinGameHandler, loseInfluencesHandler, resetGameHandler, startGameHandler } from './actionHandlers'
import { getValue, setValue } from '../utilities/storage'
import { getGameState, mutateGameState } from '../utilities/gameState'

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

describe('actionHandlers', () => {
  describe('game scenarios', () => {
    const [david, harper, hailey] =
      ['David', 'Harper', 'Hailey'].map((name) => ({
        playerName: name,
        playerId: chance.string({ length: 10 })
      }))

    it('creating, joining, resetting game', async () => {
      const { roomId } = await createGameHandler(harper)

      await joinGameHandler({ roomId, ...hailey })
      expect(joinGameHandler({ roomId, ...hailey, playerName: 'not hailey' })).rejects.toThrow(`Previously joined Room ${roomId} as ${hailey.playerName}`)

      await startGameHandler({ roomId, playerId: harper.playerId })
      expect(startGameHandler({ roomId, playerId: harper.playerId })).rejects.toThrow('Game has already started')

      expect(joinGameHandler({ roomId, ...david })).rejects.toThrow('Game has already started')
      expect(resetGameHandler({ roomId, playerId: hailey.playerId })).rejects.toThrow('Current game is in progress')

      await mutateGameState(roomId, (state) => {
        state.players.slice(1).forEach((player) => player.deadInfluences.push(...player.influences.splice(0)))
      })

      await resetGameHandler({ roomId, playerId: hailey.playerId })
      await resetGameHandler({ roomId, playerId: hailey.playerId })

      await joinGameHandler({ roomId, ...david })

      await startGameHandler({ roomId, playerId: hailey.playerId })
      expect(startGameHandler({ roomId, playerId: harper.playerId })).rejects.toThrow('Game has already started')
    })

    it('everyone passes on action', async () => {
      const { roomId } = await createGameHandler(david)

      await joinGameHandler({ roomId, ...harper })
      await joinGameHandler({ roomId, ...hailey })
      await startGameHandler({ roomId, playerId: hailey.playerId })

      await mutateGameState(roomId, (state) => {
        state.players = [
          state.players.find(({ name }) => david.playerName === name),
          state.players.find(({ name }) => harper.playerName === name),
          state.players.find(({ name }) => hailey.playerName === name)
        ]
        state.turnPlayer = david.playerName
        state.players.forEach((player) => state.deck.push(...player.influences.splice(0)))
        state.players[0].influences.push(Influences.Captain, Influences.Ambassador)
        state.players[1].influences.push(Influences.Contessa, Influences.Captain)
        state.players[2].influences.push(Influences.Assassin, Influences.Ambassador)

        const influencesUsed = [Influences.Captain, Influences.Ambassador, Influences.Contessa, Influences.Captain, Influences.Assassin, Influences.Ambassador]
        influencesUsed.forEach((influence: Influences) => {
          state.deck.splice(state.deck.findIndex((i) => i === influence), 1)
        })
      })

      expect(actionHandler({ roomId, playerId: harper.playerId, action: Actions.Tax })).rejects.toThrow('You can\'t choose an action right now')
      expect(actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Tax })).rejects.toThrow('You can\'t choose an action right now')
      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Tax })
      expect(actionHandler({ roomId, playerId: david.playerId, action: Actions.Tax })).rejects.toThrow('You can\'t choose an action right now')

      expect(actionResponseHandler({ roomId, playerId: david.playerId, response: Responses.Pass })).rejects.toThrow('You can\'t choose an action response right now')

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Pass })
      expect(actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Pass })).rejects.toThrow('You can\'t choose an action response right now')

      await actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Pass })
      expect(actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Pass })).rejects.toThrow('You can\'t choose an action response right now')

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(5)
    })

    it('successful action challenge', async () => {
      const { roomId } = await createGameHandler(david)

      await joinGameHandler({ roomId, ...harper })
      await joinGameHandler({ roomId, ...hailey })
      await startGameHandler({ roomId, playerId: hailey.playerId })

      await mutateGameState(roomId, (state) => {
        state.players = [
          state.players.find(({ name }) => david.playerName === name),
          state.players.find(({ name }) => harper.playerName === name),
          state.players.find(({ name }) => hailey.playerName === name)
        ]
        state.turnPlayer = david.playerName
        state.players.forEach((player) => state.deck.push(...player.influences.splice(0)))
        state.players[0].influences.push(Influences.Captain, Influences.Ambassador)
        state.players[1].influences.push(Influences.Contessa, Influences.Captain)
        state.players[2].influences.push(Influences.Assassin, Influences.Ambassador)

        const influencesUsed = [Influences.Captain, Influences.Ambassador, Influences.Contessa, Influences.Captain, Influences.Assassin, Influences.Ambassador]
        influencesUsed.forEach((influence: Influences) => {
          state.deck.splice(state.deck.findIndex((i) => i === influence), 1)
        })
      })

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Tax })

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Challenge })

      expect(actionChallengeResponseHandler({ roomId, playerId: harper.playerId, influence: Influences.Contessa })).rejects.toThrow('You can\'t choose a challenge response right now')
      expect(actionChallengeResponseHandler({ roomId, playerId: hailey.playerId, influence: Influences.Assassin })).rejects.toThrow('You can\'t choose a challenge response right now')

      expect(actionChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Duke })).rejects.toThrow('You don\'t have that influence')
      await actionChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Captain })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
      expect(gameState.players[0].influences).toHaveLength(1)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.players[1].coins).toBe(2)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('failed action challenge', async () => {
      const { roomId } = await createGameHandler(david)

      await joinGameHandler({ roomId, ...harper })
      await joinGameHandler({ roomId, ...hailey })
      await startGameHandler({ roomId, playerId: hailey.playerId })

      await mutateGameState(roomId, (state) => {
        state.players = [
          state.players.find(({ name }) => david.playerName === name),
          state.players.find(({ name }) => harper.playerName === name),
          state.players.find(({ name }) => hailey.playerName === name)
        ]
        state.turnPlayer = david.playerName
        state.players.forEach((player) => state.deck.push(...player.influences.splice(0)))
        state.players[0].influences.push(Influences.Captain, Influences.Ambassador)
        state.players[1].influences.push(Influences.Contessa, Influences.Captain)
        state.players[2].influences.push(Influences.Assassin, Influences.Ambassador)

        const influencesUsed = [Influences.Captain, Influences.Ambassador, Influences.Contessa, Influences.Captain, Influences.Assassin, Influences.Ambassador]
        influencesUsed.forEach((influence: Influences) => {
          state.deck.splice(state.deck.findIndex((i) => i === influence), 1)
        })
      })

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })

      expect(actionHandler({ roomId, playerId: harper.playerId, action: Actions.Steal })).rejects.toThrow('Target player is required for this action')
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Steal, targetPlayer: hailey.playerName })

      await actionResponseHandler({ roomId, playerId: david.playerId, response: Responses.Challenge })

      expect(actionChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Contessa })).rejects.toThrow('You can\'t choose a challenge response right now')
      expect(actionChallengeResponseHandler({ roomId, playerId: hailey.playerId, influence: Influences.Assassin })).rejects.toThrow('You can\'t choose a challenge response right now')

      await actionChallengeResponseHandler({ roomId, playerId: harper.playerId, influence: Influences.Captain })

      expect(loseInfluencesHandler({ roomId, playerId: david.playerId, influences: [Influences.Assassin] })).rejects.toThrow('You don\'t have those influences')
      await loseInfluencesHandler({ roomId, playerId: david.playerId, influences: [Influences.Ambassador] })

      expect(actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Challenge })).rejects.toThrow('Harper has already confirmed their claim')
      expect(actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Block })).rejects.toThrow('claimedInfluence is required when blocking')
      await actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Block, claimedInfluence: Influences.Ambassador })

      await blockResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Pass })
      await blockResponseHandler({ roomId, playerId: david.playerId, response: Responses.Challenge })

      await blockChallengeResponseHandler({ roomId, playerId: hailey.playerId, influence: Influences.Ambassador })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(hailey.playerName)
      expect(gameState.players[0].influences).toHaveLength(0)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(2)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('successful challenged block', async () => {
      const { roomId } = await createGameHandler(david)

      await joinGameHandler({ roomId, ...harper })
      await joinGameHandler({ roomId, ...hailey })
      await startGameHandler({ roomId, playerId: hailey.playerId })

      await mutateGameState(roomId, (state) => {
        state.players = [
          state.players.find(({ name }) => david.playerName === name),
          state.players.find(({ name }) => harper.playerName === name),
          state.players.find(({ name }) => hailey.playerName === name)
        ]
        state.turnPlayer = david.playerName
        state.players.forEach((player) => state.deck.push(...player.influences.splice(0)))
        state.players[0].influences.push(Influences.Captain, Influences.Ambassador)
        state.players[1].influences.push(Influences.Contessa, Influences.Captain)
        state.players[2].influences.push(Influences.Assassin, Influences.Ambassador)

        const influencesUsed = [Influences.Captain, Influences.Ambassador, Influences.Contessa, Influences.Captain, Influences.Assassin, Influences.Ambassador]
        influencesUsed.forEach((influence: Influences) => {
          state.deck.splice(state.deck.findIndex((i) => i === influence), 1)
        })
      })

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Income })

      await actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Steal, targetPlayer: david.playerName })

      await actionResponseHandler({ roomId, playerId: david.playerId, response: Responses.Block, claimedInfluence: Influences.Captain })

      await blockResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Challenge })

      expect(blockChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Contessa })).rejects.toThrow('You don\'t have that influence')
      expect(blockChallengeResponseHandler({ roomId, playerId: harper.playerId, influence: Influences.Contessa })).rejects.toThrow('You can\'t choose a challenge response right now')
      expect(blockChallengeResponseHandler({ roomId, playerId: hailey.playerId, influence: Influences.Assassin })).rejects.toThrow('You can\'t choose a challenge response right now')
      await blockChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Captain })

      await loseInfluencesHandler({ roomId, playerId: hailey.playerId, influences: [Influences.Ambassador] })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(1)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('successful bluffing block', async () => {
      const { roomId } = await createGameHandler(david)

      await joinGameHandler({ roomId, ...harper })
      await joinGameHandler({ roomId, ...hailey })
      await startGameHandler({ roomId, playerId: hailey.playerId })

      await mutateGameState(roomId, (state) => {
        state.players = [
          state.players.find(({ name }) => david.playerName === name),
          state.players.find(({ name }) => harper.playerName === name),
          state.players.find(({ name }) => hailey.playerName === name)
        ]
        state.turnPlayer = david.playerName
        state.players.forEach((player) => state.deck.push(...player.influences.splice(0)))
        state.players[0].influences.push(Influences.Captain, Influences.Ambassador)
        state.players[1].influences.push(Influences.Contessa, Influences.Captain)
        state.players[2].influences.push(Influences.Assassin, Influences.Ambassador)

        const influencesUsed = [Influences.Captain, Influences.Ambassador, Influences.Contessa, Influences.Captain, Influences.Assassin, Influences.Ambassador]
        influencesUsed.forEach((influence: Influences) => {
          state.deck.splice(state.deck.findIndex((i) => i === influence), 1)
        })
      })

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Income })

      await actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Assassinate, targetPlayer: david.playerName })

      expect(actionResponseHandler({ roomId, playerId: david.playerId, response: Responses.Block, claimedInfluence: Influences.Captain })).rejects.toThrow('claimedInfluence can\'t block this action')
      await actionResponseHandler({ roomId, playerId: david.playerId, response: Responses.Block, claimedInfluence: Influences.Contessa })

      await blockResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Pass })
      await blockResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Pass })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(4)
      expect(gameState.players[1].coins).toBe(4)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('exchanging influences', async () => {
      const { roomId } = await createGameHandler(david)

      await joinGameHandler({ roomId, ...harper })
      await joinGameHandler({ roomId, ...hailey })
      await startGameHandler({ roomId, playerId: david.playerId })

      await mutateGameState(roomId, (state) => {
        state.players = [
          state.players.find(({ name }) => david.playerName === name),
          state.players.find(({ name }) => harper.playerName === name),
          state.players.find(({ name }) => hailey.playerName === name)
        ]
        state.turnPlayer = david.playerName
        state.players.forEach((player) => state.deck.push(...player.influences.splice(0)))
        state.players[0].influences.push(Influences.Captain, Influences.Ambassador)
        state.players[1].influences.push(Influences.Contessa, Influences.Captain)
        state.players[2].influences.push(Influences.Assassin, Influences.Ambassador)

        const influencesUsed = [Influences.Captain, Influences.Ambassador, Influences.Contessa, Influences.Captain, Influences.Assassin, Influences.Ambassador]
        influencesUsed.forEach((influence: Influences) => {
          state.deck.splice(state.deck.findIndex((i) => i === influence), 1)
        })
      })

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Exchange })

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Pass })
      await actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Pass })

      await loseInfluencesHandler({ roomId, playerId: david.playerId, influences: [Influences.Captain, Influences.Ambassador] })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.players[1].coins).toBe(2)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('coup', async () => {
      const { roomId } = await createGameHandler(david)

      await joinGameHandler({ roomId, ...harper })
      await joinGameHandler({ roomId, ...hailey })
      await startGameHandler({ roomId, playerId: harper.playerId })

      await mutateGameState(roomId, (state) => {
        state.players = [
          state.players.find(({ name }) => david.playerName === name),
          state.players.find(({ name }) => harper.playerName === name),
          state.players.find(({ name }) => hailey.playerName === name)
        ]
        state.turnPlayer = david.playerName
        state.players.forEach((player) => state.deck.push(...player.influences.splice(0)))
        state.players[0].influences.push(Influences.Captain, Influences.Ambassador)
        state.players[1].influences.push(Influences.Contessa, Influences.Captain)
        state.players[2].influences.push(Influences.Assassin, Influences.Ambassador)
        state.players[2].coins = 7

        const influencesUsed = [Influences.Captain, Influences.Ambassador, Influences.Contessa, Influences.Captain, Influences.Assassin, Influences.Ambassador]
        influencesUsed.forEach((influence: Influences) => {
          state.deck.splice(state.deck.findIndex((i) => i === influence), 1)
        })
      })

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Income })

      await actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Coup, targetPlayer: david.playerName })

      await loseInfluencesHandler({ roomId, playerId: david.playerId, influences: [Influences.Ambassador] })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(1)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('challenged, successful assassination', async () => {
      const { roomId } = await createGameHandler(david)

      await joinGameHandler({ roomId, ...harper })
      await joinGameHandler({ roomId, ...hailey })
      await startGameHandler({ roomId, playerId: david.playerId })

      await mutateGameState(roomId, (state) => {
        state.players = [
          state.players.find(({ name }) => david.playerName === name),
          state.players.find(({ name }) => harper.playerName === name),
          state.players.find(({ name }) => hailey.playerName === name)
        ]
        state.turnPlayer = david.playerName
        state.players.forEach((player) => state.deck.push(...player.influences.splice(0)))
        state.players[0].influences.push(Influences.Captain, Influences.Ambassador)
        state.players[1].influences.push(Influences.Captain)
        state.players[1].deadInfluences.push(Influences.Contessa)
        state.players[2].influences.push(Influences.Assassin, Influences.Ambassador)
        state.players[2].coins = 3

        const influencesUsed = [Influences.Captain, Influences.Ambassador, Influences.Contessa, Influences.Captain, Influences.Assassin, Influences.Ambassador]
        influencesUsed.forEach((influence: Influences) => {
          state.deck.splice(state.deck.findIndex((i) => i === influence), 1)
        })
      })

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Assassinate, targetPlayer: harper.playerName })

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Challenge })

      await actionChallengeResponseHandler({ roomId, playerId: hailey.playerId, influence: Influences.Assassin })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(0)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })
  })
})
