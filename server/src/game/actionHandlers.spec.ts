import Chance from 'chance'
import { Actions, Influences, Responses } from '../../../shared/types/game'
import { actionChallengeResponseHandler, actionHandler, actionResponseHandler, blockChallengeResponseHandler, blockResponseHandler, createGameHandler, joinGameHandler, loseInfluencesHandler, removeFromGameHandler, resetGameHandler, startGameHandler } from './actionHandlers'
import { getValue, setValue } from '../utilities/storage'
import { getGameState, mutateGameState } from '../utilities/gameState'

jest.mock('../utilities/storage')

const getValueMock = jest.mocked(getValue)
const setValueMock = jest.mocked(setValue)

const inMemoryStorage: {
  [key: string]: string
} = {}

getValueMock.mockImplementation(async (key: string) => {
  await new Promise((resolve) => { setTimeout(resolve, Math.floor(Math.random() * 10)) })
  return inMemoryStorage[key]
})

setValueMock.mockImplementation(async (key: string, value: string) => {
  await new Promise((resolve) => { setTimeout(resolve, Math.floor(Math.random() * 10)) })
  inMemoryStorage[key] = value
})

const chance = new Chance()

describe('actionHandlers', () => {
  describe('game scenarios', () => {
    const [david, harper, hailey] =
      ['David', 'Harper', 'Hailey'].map((name) => ({
        playerName: name,
        playerId: chance.string({ length: 10 })
      }))

    const setupTestGame = async (players: {
      playerId: string,
      playerName: string,
      coins?: number,
      influences?: Influences[],
      deadInfluences?: Influences[]
    }[]) => {
      const { roomId } = await createGameHandler(players[0])

      for (const player of players) {
        await joinGameHandler({ roomId, ...player })
      }
      await startGameHandler({ roomId, playerId: chance.pickone(players).playerId })

      await mutateGameState(await getGameState(roomId), (state) => {
        const influencesUsed: Influences[] = []
        state.players = players.map((player) => {
          const statePlayer = state.players.find(({ name }) => player.playerName === name)
          if (player.influences) {
            state.deck.push(...statePlayer.influences.splice(0))
            statePlayer.influences.push(...player.influences)
            influencesUsed.push(...player.influences)
          }
          if (player.deadInfluences) {
            statePlayer.deadInfluences.push(...player.deadInfluences)
            influencesUsed.push(...player.deadInfluences)
          }
          return ({
            ...statePlayer,
            coins: player.coins ?? statePlayer.coins
          })
        })
        influencesUsed.forEach((influence: Influences) => {
          state.deck.splice(state.deck.findIndex((i) => i === influence), 1)
        })

        state.turnPlayer = players[0].playerName
      })

      return roomId
    }

    it('creating, joining, resetting game', async () => {
      const { roomId } = await createGameHandler(harper)

      await joinGameHandler({ roomId, ...hailey, playerName: 'not hailey' })
      await joinGameHandler({ roomId: roomId.toLowerCase(), ...hailey })

      await startGameHandler({ roomId, playerId: harper.playerId })
      await expect(startGameHandler({ roomId, playerId: harper.playerId })).rejects.toThrow('Game has already started')
      await expect(removeFromGameHandler({ roomId, playerId: hailey.playerId, playerName: david.playerName })).rejects.toThrow('Game has already started')
      await expect(joinGameHandler({ roomId, ...david })).rejects.toThrow('Game has already started')
      await expect(resetGameHandler({ roomId, playerId: hailey.playerId })).rejects.toThrow('Current game is in progress')

      await mutateGameState(await getGameState(roomId), (state) => {
        state.players.slice(1).forEach((player) => player.deadInfluences.push(...player.influences.splice(0)))
      })

      await resetGameHandler({ roomId, playerId: hailey.playerId })
      await resetGameHandler({ roomId, playerId: hailey.playerId })

      await joinGameHandler({ roomId, ...david })
      await removeFromGameHandler({ roomId, playerId: hailey.playerId, playerName: david.playerName })
      await expect(removeFromGameHandler({ roomId, playerId: hailey.playerId, playerName: david.playerName })).rejects.toThrow('Player is not in the room')

      await startGameHandler({ roomId, playerId: hailey.playerId })
      await expect(startGameHandler({ roomId, playerId: harper.playerId })).rejects.toThrow('Game has already started')
    })

    it('everyone passes on action', async () => {
      const roomId = await setupTestGame([david, harper, hailey])

      await expect(actionHandler({ roomId, playerId: harper.playerId, action: Actions.Tax })).rejects.toThrow('You can\'t choose an action right now')
      await expect(actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Tax })).rejects.toThrow('You can\'t choose an action right now')
      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Tax })
      await expect(actionHandler({ roomId, playerId: david.playerId, action: Actions.Tax })).rejects.toThrow('You can\'t choose an action right now')

      await expect(actionResponseHandler({ roomId, playerId: david.playerId, response: Responses.Pass })).rejects.toThrow('You can\'t choose an action response right now')

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Pass })
      await expect(actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Pass })).rejects.toThrow('You can\'t choose an action response right now')

      await actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Pass })
      await expect(actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Pass })).rejects.toThrow('You can\'t choose an action response right now')

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(5)
    })

    it('successful action challenge', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Ambassador] }
      ])

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Tax })

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Challenge })

      await expect(actionChallengeResponseHandler({ roomId, playerId: harper.playerId, influence: Influences.Contessa })).rejects.toThrow('You can\'t choose a challenge response right now')
      await expect(actionChallengeResponseHandler({ roomId, playerId: hailey.playerId, influence: Influences.Assassin })).rejects.toThrow('You can\'t choose a challenge response right now')

      await expect(actionChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Duke })).rejects.toThrow('You don\'t have that influence')
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
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Ambassador] }
      ])

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })

      await expect(actionHandler({ roomId, playerId: harper.playerId, action: Actions.Steal })).rejects.toThrow('Target player is required for this action')
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Steal, targetPlayer: hailey.playerName })

      await actionResponseHandler({ roomId, playerId: david.playerId, response: Responses.Challenge })

      await expect(actionChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Contessa })).rejects.toThrow('You can\'t choose a challenge response right now')
      await expect(actionChallengeResponseHandler({ roomId, playerId: hailey.playerId, influence: Influences.Assassin })).rejects.toThrow('You can\'t choose a challenge response right now')

      await actionChallengeResponseHandler({ roomId, playerId: harper.playerId, influence: Influences.Captain })

      await expect(loseInfluencesHandler({ roomId, playerId: david.playerId, influences: [Influences.Assassin] })).rejects.toThrow('You don\'t have those influences')
      await loseInfluencesHandler({ roomId, playerId: david.playerId, influences: [Influences.Ambassador] })

      await expect(actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Challenge })).rejects.toThrow('Harper has already confirmed their claim')
      await expect(actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Block })).rejects.toThrow('claimedInfluence is required when blocking')
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
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Ambassador] }
      ])

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Income })

      await actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Steal, targetPlayer: david.playerName })

      await actionResponseHandler({ roomId, playerId: david.playerId, response: Responses.Block, claimedInfluence: Influences.Captain })

      await blockResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Challenge })

      await expect(blockChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Contessa })).rejects.toThrow('You don\'t have that influence')
      await expect(blockChallengeResponseHandler({ roomId, playerId: harper.playerId, influence: Influences.Contessa })).rejects.toThrow('You can\'t choose a challenge response right now')
      await expect(blockChallengeResponseHandler({ roomId, playerId: hailey.playerId, influence: Influences.Assassin })).rejects.toThrow('You can\'t choose a challenge response right now')
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
      const roomId = await setupTestGame([david, harper, hailey])

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Income })

      await actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Assassinate, targetPlayer: david.playerName })

      await expect(actionResponseHandler({ roomId, playerId: david.playerId, response: Responses.Block, claimedInfluence: Influences.Captain })).rejects.toThrow('claimedInfluence can\'t block this action')
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
      const roomId = await setupTestGame([david, harper, hailey])

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Exchange })

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Pass })
      await actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Pass })

      let gameState = await getGameState(roomId)

      await loseInfluencesHandler({ roomId, playerId: david.playerId, influences: chance.pickset(gameState.players[0].influences, 2) })

      gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(2)
      expect(gameState.players[1].coins).toBe(2)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('coup', async () => {
      const roomId = await setupTestGame([david, harper, { ...hailey, coins: 7 }])

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Income })

      await actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Coup, targetPlayer: david.playerName })

      let gameState = await getGameState(roomId)

      await loseInfluencesHandler({ roomId, playerId: david.playerId, influences: [chance.pickone(gameState.players[0].influences)] })

      gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(1)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('challenged, successful assassination killing last influence', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain], deadInfluences: [Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Assassin], coins: 3 }
      ])

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

    it('challenged, successful assassination killing both influences', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Assassin], coins: 3 }
      ])

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: harper.playerId, action: Actions.Income })
      await actionHandler({ roomId, playerId: hailey.playerId, action: Actions.Assassinate, targetPlayer: harper.playerName })

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Challenge })

      await actionChallengeResponseHandler({ roomId, playerId: hailey.playerId, influence: Influences.Assassin })

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Block, claimedInfluence: Influences.Contessa })

      await blockResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Challenge })

      await blockChallengeResponseHandler({ roomId, playerId: harper.playerId, influence: Influences.Ambassador })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(0)
      expect(gameState.players[2].influences).toHaveLength(2)
      expect(gameState.players[0].coins).toBe(3)
      expect(gameState.players[1].coins).toBe(3)
      expect(gameState.players[2].coins).toBe(0)
    })

    it('failed challenge on tax', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Duke] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Ambassador] }
      ])

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Tax })

      await actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Challenge })

      await actionChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Duke })

      await loseInfluencesHandler({ roomId, playerId: hailey.playerId, influences: [Influences.Ambassador] })

      const gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
      expect(gameState.players[0].influences).toHaveLength(2)
      expect(gameState.players[1].influences).toHaveLength(2)
      expect(gameState.players[2].influences).toHaveLength(1)
      expect(gameState.players[0].coins).toBe(5)
      expect(gameState.players[1].coins).toBe(2)
      expect(gameState.players[2].coins).toBe(2)
    })

    it('multiple coups sent to server in rapid succession', async () => {
      const roomId = await setupTestGame([{ ...david, coins: 11 }, harper, hailey])

      const results = await Promise.allSettled(Array.from({ length: 100 }, () =>
        actionHandler({ roomId, playerId: david.playerId, action: Actions.Coup, targetPlayer: harper.playerName })
      ))

      expect(results.some(({ status }) => status === 'rejected')).toBe(true)

      const gameState = await getGameState(roomId)

      expect(gameState.players[0].coins).toBe(4)
    })

    it('failed challenge, lost influence before new action response', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Assassin] }
      ])

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Steal, targetPlayer: harper.playerName })

      await actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Challenge })

      await actionChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Captain })

      await loseInfluencesHandler({ roomId, playerId: hailey.playerId, influences: [Influences.Assassin] })

      let gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Pass })

      gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
    })

    it('failed challenge, lost influence after new action response', async () => {
      const roomId = await setupTestGame([
        { ...david, influences: [Influences.Captain, Influences.Ambassador] },
        { ...harper, influences: [Influences.Captain, Influences.Ambassador] },
        { ...hailey, influences: [Influences.Captain, Influences.Assassin] }
      ])

      await actionHandler({ roomId, playerId: david.playerId, action: Actions.Steal, targetPlayer: harper.playerName })

      await actionResponseHandler({ roomId, playerId: hailey.playerId, response: Responses.Challenge })

      await actionChallengeResponseHandler({ roomId, playerId: david.playerId, influence: Influences.Captain })

      await actionResponseHandler({ roomId, playerId: harper.playerId, response: Responses.Pass })

      let gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(david.playerName)

      await loseInfluencesHandler({ roomId, playerId: hailey.playerId, influences: [Influences.Assassin] })

      gameState = await getGameState(roomId)

      expect(gameState.turnPlayer).toBe(harper.playerName)
    })
  })
})
