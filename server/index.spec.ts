import Chance from 'chance'
import { io, Socket } from 'socket.io-client'
import { Actions, DehydratedPlayer, DehydratedPublicGameState, DehydratedPublicPlayer, PlayerActions, Responses, ServerEvents } from '../shared/types/game'
import { DehydratedPublicGameStateOrError } from './index'
import { MAX_PLAYER_COUNT } from '../shared/helpers/playerCount'
import { AvailableLanguageCode } from '../shared/i18n/availableLanguages'

const chance = new Chance()

const baseUrl = 'http://localhost:8008'

const validatePublicState = (gameState: DehydratedPublicGameState) => {
  expect(Object.keys(gameState)).toEqual(expect.arrayContaining([
    "eventLogs",
    "isStarted",
    "pendingInfluenceLoss",
    "players",
    "roomId",
    "selfPlayer"
  ]))

  expect(Object.keys(gameState)).not.toContain("deck")
  expect(Object.keys(gameState)).not.toContain("availablePlayerColors")

  expect(gameState.selfPlayer).toBeTruthy()
  gameState.players.forEach((player: DehydratedPlayer & DehydratedPublicPlayer) => {
    expect(player.id).toBeUndefined()
    expect(player.influences).toBeUndefined()
    expect(player.influenceCount).toBeDefined()
    expect(player.name).toBeTruthy()
    expect(player.coins).toBeTruthy()
    expect(player.color).toBeTruthy()
  })
}

describe('index', () => {
  describe('rest endpoints', () => {
    const getApi = async (endpoint: string, query: Record<string, string>) => {
      if (!query.language) {
        query.language = AvailableLanguageCode['en-US']
      }

      const response = await fetch(`${baseUrl}/${endpoint}?${new URLSearchParams(query)}`, {
        method: 'get',
        headers: { 'content-type': 'application/json' }
      })

      const json: DehydratedPublicGameStateOrError = await response.json()

      return { json, status: response.status }
    }

    const postApi = async (endpoint: string, body: object) => {
      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ language: AvailableLanguageCode['en-US'], ...body })
      })

      const json: DehydratedPublicGameStateOrError = await response.json()

      return { json, status: response.status }
    }

    describe(PlayerActions.gameState, () => {
      it.each([
        {
          getQueryParams: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const { json: { gameState } } = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            return { roomId: gameState?.roomId, playerId }
          },
          error: '',
          status: 200
        },
        {
          getQueryParams: () => ({}),
          error: 'Invalid user request',
          status: 400
        },
        {
          getQueryParams: () => ({ language: 'pt-BR' }),
          error: 'Solicitação de usuário inválida',
          status: 400
        }
      ] as {
        getQueryParams: () => Promise<Partial<{ roomId: string, playerId: string, playerName: string }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ getQueryParams, error, status }) => {
        const queryParams = await getQueryParams()

        const response = await getApi('gameState', queryParams)

        expect(response.status).toBe(status)
        if (error) {
          expect(response.json).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(response.json.gameState!)
        }
      })
    })

    describe(PlayerActions.createGame, () => {
      it.each([
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 10 }),
            settings: { eventLogRetentionTurns: 100, allowRevive: true }
          },
          error: '',
          status: 200
        },
        {
          body: {},
          error: 'Invalid user request',
          status: 400
        },
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 10 }),
            settings: {}
          },
          error: 'Invalid user request',
          status: 400
        },
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 10 }),
            settings: { allowRevive: true }
          },
          error: 'Invalid user request',
          status: 400
        },
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 10 }),
            settings: { eventLogRetentionTurns: 100 }
          },
          error: 'Invalid user request',
          status: 400
        },
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 11 }),
            settings: { eventLogRetentionTurns: 100, allowRevive: true }
          },
          error: 'Invalid user request',
          status: 400
        },
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 10 }),
            settings: { eventLogRetentionTurns: 0 }
          },
          error: 'Invalid user request',
          status: 400
        },
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 10 }),
            settings: { eventLogRetentionTurns: 101 }
          },
          error: 'Invalid user request',
          status: 400
        }
      ] as {
        body: Partial<{ playerId: string, playerName: string }>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ body, error, status }) => {
        const response = await postApi(PlayerActions.createGame, body)

        expect(response.status).toBe(status)
        const responseJson = response.json
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson.gameState!)
        }
      })
    })

    describe(PlayerActions.joinGame, () => {
      it.each([
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            return { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) }
          },
          error: '',
          status: 200
        },
        {
          getBody: () => ({}),
          error: 'Invalid user request',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 11 })
          }),
          error: 'Invalid user request',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 10 })
          }),
          error: 'Room not found',
          status: 404
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            return { roomId, playerId, playerName: chance.string({ length: 10 }) }
          },
          error: '',
          status: 200
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            for (let i = 0; i < MAX_PLAYER_COUNT - 1; i++) {
              await postApi(PlayerActions.joinGame, { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) })
            }

            return { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) }
          },
          error: /Room .+ is full/,
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            await postApi(PlayerActions.joinGame, { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) })
            await postApi(PlayerActions.startGame, { roomId, playerId })

            return { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) }
          },
          error: 'Game is in progress',
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            return { roomId, playerId: chance.string({ length: 10 }), playerName }
          },
          error: /Room already has a player named .+/,
          status: 400
        }
      ] as {
        getBody: () => Promise<Partial<{ roomId: string, playerId: string, playerName: string }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ getBody, error, status }) => {
        const body = await getBody()
        const response = await postApi(PlayerActions.joinGame, body)

        expect(response.status).toBe(status)
        const responseJson = response.json
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson.gameState!)
          expect(responseJson.gameState!.players).toContainEqual(expect.objectContaining({
            name: body.playerName
          }))
        }
      })
    })

    describe(PlayerActions.removeFromGame, () => {
      it.each([
        {
          testSetup: async () => {
            const removingPlayer = {
              id: chance.string({ length: 10 }),
              name: chance.string({ length: 10 }),
            }
            const removedPlayer = {
              id: chance.string({ length: 10 }),
              name: chance.string({ length: 10 }),
            }

            const response = await postApi(PlayerActions.createGame, { playerId: removingPlayer.id, playerName: removingPlayer.name, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            await postApi(PlayerActions.joinGame, { roomId, playerId: removedPlayer.id, playerName: removedPlayer.name })

            return { roomId, removingPlayer, removedPlayer }
          },
          error: '',
          status: 200
        },
        {
          testSetup: () => ({}),
          error: 'Invalid user request',
          status: 400
        }
      ] as {
        testSetup: () => Promise<Partial<{ roomId: string, removingPlayer: { id: string, name: string }, removedPlayer: { id: string, name: string } }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ testSetup, error, status }) => {
        const { roomId, removedPlayer, removingPlayer } = await testSetup()
        const response = await postApi(PlayerActions.removeFromGame, {
          roomId,
          playerId: removingPlayer?.id,
          playerName: removedPlayer?.name
        })

        expect(response.status).toBe(status)
        const responseJson = response.json
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson.gameState!)
          expect(responseJson.gameState!.players).toHaveLength(1)
          expect(responseJson.gameState!.players).toContainEqual(expect.objectContaining({
            name: removingPlayer!.name
          }))
          expect(responseJson.gameState!.players).not.toContainEqual(expect.objectContaining({
            name: removedPlayer!.name
          }))
        }
      })
    })

    describe(PlayerActions.resetGameRequest, () => {
      it.each([
        {
          getBody: async () => {
            const players = [{
              id: chance.string({ length: 10 }),
              name: chance.string({ length: 10 })
            }, {
              id: chance.string({ length: 10 }),
              name: chance.string({ length: 10 })
            }]

            const response = await postApi(PlayerActions.createGame, {
              playerId: players[0].id,
              playerName: players[0].name,
              settings: { eventLogRetentionTurns: 100, allowRevive: true }
            })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            await postApi(PlayerActions.joinGame, {
              roomId,
              playerId: players[1].id,
              playerName: players[1].name
            })

            await postApi(PlayerActions.startGame, { roomId, playerId: players[0].id })

            return { roomId, playerId: players[0].id }
          },
          error: '',
          status: 200
        },
        {
          getBody: () => ({}),
          error: 'Invalid user request',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 })
          }),
          error: 'Room not found',
          status: 404
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            return { roomId, playerId: chance.string({ length: 10 }) }
          },
          error: 'Player is not in the game',
          status: 400
        }
      ] as {
        getBody: () => Promise<Partial<{ roomId: string, playerId: string }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ getBody, error, status }) => {
        const response = await postApi(PlayerActions.resetGameRequest, await getBody())

        expect(response.status).toBe(status)
        const responseJson = response.json
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson.gameState!)
          expect(responseJson.gameState!.isStarted).toBe(true)
          expect(responseJson.gameState!.resetGameRequest).toBeTruthy()
        }
      })
    })

    describe(PlayerActions.resetGameRequestCancel, () => {
      it.each([
        {
          getBody: async () => {
            const players = [{
              id: chance.string({ length: 10 }),
              name: chance.string({ length: 10 })
            }, {
              id: chance.string({ length: 10 }),
              name: chance.string({ length: 10 })
            }]

            const response = await postApi(PlayerActions.createGame, {
              playerId: players[0].id,
              playerName: players[0].name,
              settings: { eventLogRetentionTurns: 100, allowRevive: true }
            })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            await postApi(PlayerActions.joinGame, {
              roomId,
              playerId: players[1].id,
              playerName: players[1].name
            })

            await postApi(PlayerActions.startGame, { roomId, playerId: players[0].id })
            await postApi(PlayerActions.resetGameRequest, { roomId, playerId: players[0].id })

            return { roomId, playerId: players[0].id }
          },
          error: '',
          status: 200
        },
        {
          getBody: () => ({}),
          error: 'Invalid user request',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 })
          }),
          error: 'Room not found',
          status: 404
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            return { roomId, playerId: chance.string({ length: 10 }) }
          },
          error: 'Player is not in the game',
          status: 400
        }
      ] as {
        getBody: () => Promise<Partial<{ roomId: string, playerId: string }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ getBody, error, status }) => {
        const response = await postApi(PlayerActions.resetGameRequestCancel, await getBody())

        expect(response.status).toBe(status)
        const responseJson = response.json
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson.gameState!)
          expect(responseJson.gameState!.isStarted).toBe(true)
          expect(responseJson.gameState!.resetGameRequest).toBeUndefined()
        }
      })
    })

    describe(PlayerActions.resetGame, () => {
      it.each([
        {
          getBody: async () => {
            const players = [{
              id: chance.string({ length: 10 }),
              name: chance.string({ length: 10 })
            }, {
              id: chance.string({ length: 10 }),
              name: chance.string({ length: 10 })
            }]

            let response = await postApi(PlayerActions.createGame, {
              playerId: players[0].id,
              playerName: players[0].name,
              settings: { eventLogRetentionTurns: 100, allowRevive: true }
            })

            let { json: { gameState } } = response
            const roomId = gameState?.roomId

            await postApi(PlayerActions.joinGame, {
              roomId,
              playerId: players[1].id,
              playerName: players[1].name
            })

            response = await postApi(PlayerActions.startGame, { roomId, playerId: players[0].id })

            gameState = response.json.gameState!
            const turnPlayerName = gameState.turnPlayer
            const firstPlayerIndex = gameState.players.findIndex(({ name }) => name === turnPlayerName)

            const privatePlayers = gameState.players.map(({ name }) => ({
              id: players.find((player) => player.name === name)!.id,
              name
            }))

            await postApi(PlayerActions.action, { roomId, playerId: privatePlayers[firstPlayerIndex].id, action: Actions.Tax })
            await postApi(PlayerActions.actionResponse, { roomId, playerId: privatePlayers[(firstPlayerIndex + 1) % privatePlayers.length].id, response: Responses.Pass })
            await postApi(PlayerActions.action, { roomId, playerId: privatePlayers[(firstPlayerIndex + 1) % privatePlayers.length].id, action: Actions.Income })
            await postApi(PlayerActions.action, { roomId, playerId: privatePlayers[(firstPlayerIndex + 2) % privatePlayers.length].id, action: Actions.Tax })
            await postApi(PlayerActions.actionResponse, { roomId, playerId: privatePlayers[(firstPlayerIndex + 3) % privatePlayers.length].id, response: Responses.Pass })
            await postApi(PlayerActions.action, { roomId, playerId: privatePlayers[(firstPlayerIndex + 3) % privatePlayers.length].id, action: Actions.Income })
            await postApi(PlayerActions.action, { roomId, playerId: privatePlayers[(firstPlayerIndex + 4) % privatePlayers.length].id, action: Actions.Assassinate, targetPlayer: privatePlayers[(firstPlayerIndex + 5) % privatePlayers.length].name })
            response = await postApi(PlayerActions.actionResponse, { roomId, playerId: privatePlayers[(firstPlayerIndex + 5) % privatePlayers.length].id, response: Responses.Pass })
            gameState = response.json.gameState!
            await postApi(PlayerActions.loseInfluences, { roomId, playerId: privatePlayers[(firstPlayerIndex + 5) % privatePlayers.length].id, influences: [gameState.selfPlayer?.influences[0]] })
            await postApi(PlayerActions.action, { roomId, playerId: privatePlayers[(firstPlayerIndex + 5) % privatePlayers.length].id, action: Actions.Income })
            await postApi(PlayerActions.action, { roomId, playerId: privatePlayers[(firstPlayerIndex + 6) % privatePlayers.length].id, action: Actions.Assassinate, targetPlayer: privatePlayers[(firstPlayerIndex + 7) % privatePlayers.length].name })
            await postApi(PlayerActions.actionResponse, { roomId, playerId: privatePlayers[(firstPlayerIndex + 7) % privatePlayers.length].id, response: Responses.Pass })

            return { roomId, playerId: players[0].id }
          },
          error: '',
          status: 200
        },
        {
          getBody: () => ({}),
          error: 'Invalid user request',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 })
          }),
          error: 'Room not found',
          status: 404
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            return { roomId, playerId: chance.string({ length: 10 }) }
          },
          error: 'Player is not in the game',
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            await postApi(PlayerActions.joinGame, {
              roomId,
              playerId: chance.string({ length: 10 }),
              playerName: chance.string({ length: 10 })
            })
            await postApi(PlayerActions.startGame, { roomId, playerId })

            return { roomId, playerId }
          },
          error: 'Game is in progress',
          status: 400
        }
      ] as {
        getBody: () => Promise<Partial<{ roomId: string, playerId: string }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ getBody, error, status }) => {
        const response = await postApi(PlayerActions.resetGame, await getBody())

        expect(response.status).toBe(status)
        const responseJson = response.json
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson.gameState!)
          expect(responseJson.gameState!.players.every((player: DehydratedPublicPlayer) => player.influenceCount === 2))
          expect(responseJson.gameState!.isStarted).toBe(false)
        }
      })
    })

    describe(PlayerActions.startGame, () => {
      it.each([
        {
          getBody: async () => {
            const players = [{
              id: chance.string({ length: 10 }),
              name: chance.string({ length: 10 })
            }, {
              id: chance.string({ length: 10 }),
              name: chance.string({ length: 10 })
            }]

            const response = await postApi(PlayerActions.createGame, {
              playerId: players[0].id,
              playerName: players[0].name,
              settings: { eventLogRetentionTurns: 100, allowRevive: true }
            })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            await postApi(PlayerActions.joinGame, {
              roomId,
              playerId: players[1].id,
              playerName: players[1].name
            })

            return { roomId, playerId: players[0].id }
          },
          error: '',
          status: 200
        },
        {
          getBody: () => ({}),
          error: 'Invalid user request',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 })
          }),
          error: 'Room not found',
          status: 404
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            return { roomId, playerId: chance.string({ length: 10 }) }
          },
          error: 'Player is not in the game',
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            return { roomId, playerId }
          },
          error: 'Game needs at least 2 players to start',
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName, settings: { eventLogRetentionTurns: 100, allowRevive: true } })

            const { json: { gameState } } = response
            const roomId = gameState?.roomId

            await postApi(PlayerActions.joinGame, {
              roomId,
              playerId: chance.string({ length: 10 }),
              playerName: chance.string({ length: 10 })
            })

            await postApi(PlayerActions.startGame, { roomId, playerId })

            return { roomId, playerId }
          },
          error: 'Game is in progress',
          status: 400
        }
      ] as {
        getBody: () => Promise<Partial<{ roomId: string, playerId: string }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ getBody, error, status }) => {
        const response = await postApi(PlayerActions.startGame, await getBody())

        expect(response.status).toBe(status)
        const responseJson = response.json
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson.gameState!)
          expect(responseJson.gameState!.isStarted).toBe(true)
        }
      })
    })
  })

  describe('socket messages', () => {
    const getConnectedSocket = async () => {
      const socket = io(baseUrl)
      const promise = new Promise((resolve) => {
        socket.on('connect', () => { resolve(undefined) })
      })
      await promise
      return socket
    }

    const getGameStatePromises = (sockets: Socket[]) => {
      return sockets.map((socket) => {
        let resolver: (value?: unknown) => void
        let rejector: (error: Error) => void
        const promise = new Promise<DehydratedPublicGameState>((resolve, reject) => {
          resolver = resolve
          rejector = reject
        })
        socket.removeAllListeners(ServerEvents.gameStateChanged).on(ServerEvents.gameStateChanged, (gameState: DehydratedPublicGameState) => {
          resolver(gameState)
        })
        socket.removeAllListeners(ServerEvents.error).on(ServerEvents.error, (error: string) => {
          rejector(new Error(error))
        })
        return promise
      })
    }

    it('should be able to establish a connection to the socket server', async () => {
      const socket = await getConnectedSocket()

      try {
        expect(socket.connected).toBe(true)
      } finally {
        socket.close()
      }
    })

    it('should create game, join game, start game', async () => {
      const socket1 = await getConnectedSocket()
      const socket2 = await getConnectedSocket()
      try {
        const player1 = {
          playerId: chance.string({ length: 10 }),
          playerName: chance.string({ length: 10 })
        }
        const player2 = {
          playerId: chance.string({ length: 10 }),
          playerName: chance.string({ length: 10 })
        }

        let gameStatePromises = getGameStatePromises([socket1])
        socket1.emit(PlayerActions.createGame, {})
        await expect(gameStatePromises[0]).rejects.toThrow('Invalid user request')

        gameStatePromises = getGameStatePromises([socket1])
        socket1.emit(PlayerActions.createGame, {
          ...player1,
          settings: { eventLogRetentionTurns: 100, allowRevive: true },
          language: AvailableLanguageCode['en-US']
        })
        const { roomId } = await gameStatePromises[0]

        gameStatePromises = getGameStatePromises([socket1, socket2])
        socket2.emit(PlayerActions.joinGame, { roomId, ...player2, language: AvailableLanguageCode['en-US'] })
        let returnedGameStates = await Promise.all(gameStatePromises)
        returnedGameStates.forEach((returnedGameState) => {
          expect(returnedGameState.players.length).toBe(2)
          expect(returnedGameState.isStarted).toBe(false)
        })

        gameStatePromises = getGameStatePromises([socket1])
        socket1.emit(PlayerActions.joinGame, {})
        await expect(gameStatePromises[0]).rejects.toThrow('Invalid user request')

        gameStatePromises = getGameStatePromises([socket1])
        socket1.emit(PlayerActions.joinGame, { language: AvailableLanguageCode['pt-BR'] })
        await expect(gameStatePromises[0]).rejects.toThrow('Solicitação de usuário inválida')

        gameStatePromises = getGameStatePromises([socket2])
        socket2.emit(PlayerActions.joinGame, {
          roomId: chance.string({ length: 10 }),
          playerId: chance.string({ length: 10 }),
          playerName: chance.string({ length: 10 }),
          language: AvailableLanguageCode['en-US']
        })
        await expect(gameStatePromises[0]).rejects.toThrow('Room not found')

        gameStatePromises = getGameStatePromises([socket1, socket2])
        socket1.emit(PlayerActions.startGame, { roomId, playerId: player1.playerId, language: AvailableLanguageCode['en-US'] })
        returnedGameStates = await Promise.all(gameStatePromises)
        returnedGameStates.forEach((returnedGameState) => {
          expect(returnedGameState.isStarted).toBe(true)
        })

        gameStatePromises = getGameStatePromises([socket1])
        socket1.emit(PlayerActions.gameState, { roomId, playerId: player2.playerId, language: AvailableLanguageCode['en-US'] })
        await expect(gameStatePromises[0]).rejects.toThrow('Wrong player ID on socket')

        gameStatePromises = getGameStatePromises([socket1])
        socket1.emit(PlayerActions.gameState, { roomId, playerId: player1.playerId, language: AvailableLanguageCode['en-US'] })
        const gameState = await gameStatePromises[0]

        validatePublicState(gameState)

        expect(gameState.players).toContainEqual(expect.objectContaining({ name: player1.playerName }))
        expect(gameState.players).toContainEqual(expect.objectContaining({ name: player2.playerName }))
        expect(gameState.isStarted).toBe(true)
      } finally {
        socket1.close()
        socket2.close()
      }
    })
  })
})
