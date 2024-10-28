import Chance from 'chance'
import { io, Socket } from 'socket.io-client'
import { Actions, Influences, Player, PlayerActions, PublicGameState, PublicPlayer, Responses, ServerEvents } from '../shared/types/game'

const chance = new Chance()

const baseUrl = 'http://localhost:8008'

const validatePublicState = (gameState: PublicGameState) => {
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
  gameState.players.forEach((player: Player & PublicPlayer) => {
    expect(player.id).toBeUndefined()
    expect(player.influences).toBeUndefined()
    expect(player.influenceCount).toBeTruthy()
    expect(player.name).toBeTruthy()
    expect(player.coins).toBeTruthy()
    expect(player.color).toBeTruthy()
  })
}

describe('index', () => {
  describe('rest endpoints', () => {
    const getApi = (endpoint: string) =>
      fetch(`${baseUrl}/${endpoint}`, {
        method: 'get',
        headers: { 'content-type': 'application/json' }
      })

    const postApi = (endpoint: string, body: object) =>
      fetch(`${baseUrl}/${endpoint}`, {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      })

    describe(PlayerActions.gameState, () => {
      it.each([
        {
          getQueryParams: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            return { roomId, playerId }
          },
          error: '',
          status: 200
        },
        {
          getQueryParams: () => ({}),
          error: '"roomId" is required, "playerId" is required',
          status: 400
        }
      ] as {
        getQueryParams: () => Promise<Partial<{ roomId: string, playerId: string, playerName: string }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ getQueryParams, error, status }) => {
        const queryParams = await getQueryParams()
        const queryString = Object.entries(queryParams)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&')

        const response = await getApi(`gameState?${queryString}`)

        expect(response.status).toBe(status)
        const responseJson = await response.json()
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson)
        }
      })
    })

    describe(PlayerActions.createGame, () => {
      it.each([
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 10 })
          },
          error: '',
          status: 200
        },
        {
          body: {},
          error: '"playerId" is required, "playerName" is required',
          status: 400
        },
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 11 })
          },
          error: '"playerName" length must be less than or equal to 10 characters long',
          status: 400
        },
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: Influences.Duke
          },
          error: '"playerName" contains an invalid value',
          status: 400
        },
        {
          body: {
            playerId: chance.string({ length: 10 }),
            playerName: Actions.Exchange
          },
          error: '"playerName" contains an invalid value',
          status: 400
        }
      ] as {
        body: Partial<{ playerId: string, playerName: string }>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ body, error, status }) => {
        const response = await postApi(PlayerActions.createGame, body)

        expect(response.status).toBe(status)
        const responseJson = await response.json()
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson)
        }
      })
    })

    describe(PlayerActions.joinGame, () => {
      it.each([
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            return { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) }
          },
          error: '',
          status: 200
        },
        {
          getBody: () => ({}),
          error: '"roomId" is required, "playerId" is required, "playerName" is required',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 11 })
          }),
          error: '"playerName" length must be less than or equal to 10 characters long',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 }),
            playerName: chance.string({ length: 10 })
          }),
          error: /Room .+ does not exist/,
          status: 404
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            return { roomId, playerId, playerName: chance.string({ length: 10 }) }
          },
          error: '',
          status: 200
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            for (let i = 0; i < 5; i++) {
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

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId
            await postApi(PlayerActions.joinGame, { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) })
            await postApi(PlayerActions.startGame, { roomId, playerId })

            return { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) }
          },
          error: 'Game has already started',
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            return { roomId, playerId: chance.string({ length: 10 }), playerName: Influences.Captain }
          },
          error: '"playerName" contains an invalid value',
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            return { roomId, playerId: chance.string({ length: 10 }), playerName: Actions.Income }
          },
          error: '"playerName" contains an invalid value',
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            return { roomId, playerId: chance.string({ length: 10 }), playerName }
          },
          error: /Room .+ already has player named .+/,
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
        const responseJson = await response.json()
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson)
          expect(responseJson.players).toContainEqual(expect.objectContaining({
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

            const response = await postApi(PlayerActions.createGame, { playerId: removingPlayer.id, playerName: removingPlayer.name })

            const roomId = (await response.json()).roomId

            await postApi(PlayerActions.joinGame, { roomId, playerId: removedPlayer.id, playerName: removedPlayer.name })

            return { roomId, removingPlayer, removedPlayer }
          },
          error: '',
          status: 200
        },
        {
          testSetup: () => ({}),
          error: '"roomId" is required, "playerId" is required, "playerName" is required',
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
        const responseJson = await response.json()
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson)
          expect(responseJson.players).toHaveLength(1)
          expect(responseJson.players).toContainEqual(expect.objectContaining({
            name: removingPlayer!.name
          }))
          expect(responseJson.players).not.toContainEqual(expect.objectContaining({
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
              playerName: players[0].name
            })

            const roomId = (await response.json()).roomId

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
          error: '"roomId" is required, "playerId" is required',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 })
          }),
          error: /Room .+ does not exist/,
          status: 404
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            return { roomId, playerId: chance.string({ length: 10 }) }
          },
          error: 'Player not in game',
          status: 400
        }
      ] as {
        getBody: () => Promise<Partial<{ roomId: string, playerId: string }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ getBody, error, status }) => {
        const response = await postApi(PlayerActions.resetGameRequest, await getBody())

        expect(response.status).toBe(status)
        const responseJson = await response.json()
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson)
          expect(responseJson.isStarted).toBe(true)
          expect(responseJson.resetGameRequest).toBeTruthy()
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
              playerName: players[0].name
            })

            const roomId = (await response.json()).roomId

            await postApi(PlayerActions.joinGame, {
              roomId,
              playerId: players[1].id,
              playerName: players[1].name
            })

            response = await postApi(PlayerActions.startGame, { roomId, playerId: players[0].id })

            let gameState = await response.json() as PublicGameState
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
            gameState = await response.json() as PublicGameState
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
          error: '"roomId" is required, "playerId" is required',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 })
          }),
          error: /Room .+ does not exist/,
          status: 404
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            return { roomId, playerId: chance.string({ length: 10 }) }
          },
          error: 'Player not in game',
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            await postApi(PlayerActions.joinGame, {
              roomId,
              playerId: chance.string({ length: 10 }),
              playerName: chance.string({ length: 10 })
            })
            await postApi(PlayerActions.startGame, { roomId, playerId })

            return { roomId, playerId }
          },
          error: 'Current game is in progress',
          status: 400
        }
      ] as {
        getBody: () => Promise<Partial<{ roomId: string, playerId: string }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ getBody, error, status }) => {
        const response = await postApi(PlayerActions.resetGame, await getBody())

        expect(response.status).toBe(status)
        const responseJson = await response.json()
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson)
          expect(responseJson.players.every((player: PublicPlayer) => player.influenceCount === 2))
          expect(responseJson.isStarted).toBe(false)
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
              playerName: players[0].name
            })

            const roomId = (await response.json()).roomId

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
          error: '"roomId" is required, "playerId" is required',
          status: 400
        },
        {
          getBody: () => ({
            roomId: chance.string({ length: 10 }),
            playerId: chance.string({ length: 10 })
          }),
          error: /Room .+ does not exist/,
          status: 404
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            return { roomId, playerId: chance.string({ length: 10 }) }
          },
          error: 'Player not in game',
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            return { roomId, playerId }
          },
          error: 'Game must have at least 2 players to start',
          status: 400
        },
        {
          getBody: async () => {
            const playerId = chance.string({ length: 10 })
            const playerName = chance.string({ length: 10 })

            const response = await postApi(PlayerActions.createGame, { playerId, playerName })

            const roomId = (await response.json()).roomId

            await postApi(PlayerActions.joinGame, {
              roomId,
              playerId: chance.string({ length: 10 }),
              playerName: chance.string({ length: 10 })
            })

            await postApi(PlayerActions.startGame, { roomId, playerId })

            return { roomId, playerId }
          },
          error: 'Game has already started',
          status: 400
        }
      ] as {
        getBody: () => Promise<Partial<{ roomId: string, playerId: string }>>,
        error: string,
        status: number
      }[])('should return $status $error', async ({ getBody, error, status }) => {
        const response = await postApi(PlayerActions.startGame, await getBody())

        expect(response.status).toBe(status)
        const responseJson = await response.json()
        if (error) {
          expect(responseJson).toEqual({ error: expect.stringMatching(error) })
        } else {
          validatePublicState(responseJson)
          expect(responseJson.isStarted).toBe(true)
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
        const promise = new Promise<PublicGameState>((resolve, reject) => {
          resolver = resolve
          rejector = reject
        })
        socket.removeAllListeners(ServerEvents.gameStateChanged).on(ServerEvents.gameStateChanged, (gameState: PublicGameState) => {
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

      expect(socket.connected).toBe(true)

      socket.close()
    })

    it('should create game, join game, start game', async () => {
      const socket1 = await getConnectedSocket()
      const socket2 = await getConnectedSocket()

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
      await expect(gameStatePromises[0]).rejects.toThrow('"playerId" is required, "playerName" is required')

      gameStatePromises = getGameStatePromises([socket1])
      socket1.emit(PlayerActions.createGame, player1)
      const { roomId } = await gameStatePromises[0]

      gameStatePromises = getGameStatePromises([socket1, socket2])
      socket2.emit(PlayerActions.joinGame, { roomId, ...player2 })
      await Promise.all(gameStatePromises)

      gameStatePromises = getGameStatePromises([socket1])
      socket1.emit(PlayerActions.joinGame, {})
      await expect(gameStatePromises[0]).rejects.toThrow('"roomId" is required, "playerId" is required, "playerName" is required')

      gameStatePromises = getGameStatePromises([socket2])
      socket2.emit(PlayerActions.joinGame, {
        roomId: chance.string({ length: 10 }),
        playerId: chance.string({ length: 10 }),
        playerName: chance.string({ length: 10 })
      })
      await expect(gameStatePromises[0]).rejects.toThrow(/Room .+ does not exist/)

      gameStatePromises = getGameStatePromises([socket1, socket2])
      socket1.emit(PlayerActions.startGame, { roomId, playerId: player1.playerId })
      await Promise.all(gameStatePromises)

      gameStatePromises = getGameStatePromises([socket1])
      socket1.emit(PlayerActions.gameState, { roomId, playerId: player2.playerId })
      await expect(gameStatePromises[0]).rejects.toThrow('playerId does not match socket')

      gameStatePromises = getGameStatePromises([socket1])
      socket1.emit(PlayerActions.gameState, { roomId, playerId: player1.playerId })
      const gameState = await gameStatePromises[0]

      validatePublicState(gameState)

      expect(gameState.players).toContainEqual(expect.objectContaining({ name: player1.playerName }))
      expect(gameState.players).toContainEqual(expect.objectContaining({ name: player2.playerName }))
      expect(gameState.isStarted).toBe(true)

      socket1.close()
      socket2.close()
    })
  })
})
