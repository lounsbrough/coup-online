import Chance from 'chance'
import { Actions, GameState, Influences, Player, PublicGameState, PublicPlayer, Responses } from '../shared/types/game'

const chance = new Chance()

const getApi = (endpoint: string) =>
    fetch(`http://localhost:8008/${endpoint}`, {
        method: 'get',
        headers: { 'content-type': 'application/json' }
    })

const postApi = (endpoint: string, body: object) =>
    fetch(`http://localhost:8008/${endpoint}`, {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
    })

const validatePublicState = (gameState: GameState & PublicGameState) => {
    expect(gameState.selfPlayer).toBeTruthy()
    expect(gameState.deck).toBeUndefined()
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
    describe('gameState', () => {
        it.each([
            {
                getQueryParams: async () => {
                    const playerId = chance.string({ length: 10 })
                    const playerName = chance.string({ length: 10 })

                    const response = await postApi('createGame', { playerId, playerName })

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
            },
            {
                getQueryParams: () => ({
                    roomId: chance.string({ length: 10 }),
                    playerId: chance.string({ length: 10 })
                }),
                error: /Room .+ does not exist/,
                status: 404
            },
            {
                getQueryParams: async () => {
                    const playerId = chance.string({ length: 10 })
                    const playerName = chance.string({ length: 10 })

                    const response = await postApi('createGame', { playerId, playerName })

                    const roomId = (await response.json()).roomId

                    return { roomId, playerId: chance.string({ length: 10 }) }
                },
                error: 'Player not in game',
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

    describe('createGame', () => {
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
            const response = await postApi('createGame', body)

            expect(response.status).toBe(status)
            const responseJson = await response.json()
            if (error) {
                expect(responseJson).toEqual({ error: expect.stringMatching(error) })
            } else {
                validatePublicState(responseJson)
            }
        })
    })

    describe('joinGame', () => {
        it.each([
            {
                getBody: async () => {
                    const playerId = chance.string({ length: 10 })
                    const playerName = chance.string({ length: 10 })

                    const response = await postApi('createGame', { playerId, playerName })

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

                    const response = await postApi('createGame', { playerId, playerName })

                    const roomId = (await response.json()).roomId

                    return { roomId, playerId, playerName: chance.string({ length: 10 }) }
                },
                error: /Previously joined Room .+ as .+/,
                status: 400
            },
            {
                getBody: async () => {
                    const playerId = chance.string({ length: 10 })
                    const playerName = chance.string({ length: 10 })

                    const response = await postApi('createGame', { playerId, playerName })

                    const roomId = (await response.json()).roomId

                    for (let i = 0; i < 5; i++) {
                        await postApi('joinGame', { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) })
                    }

                    // TODO: handle race condition for state mutations. i.e., this should pass:
                    // await Promise.all(Array.from({ length: 6 }, () =>
                    //     postApi('joinGame', { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) })))

                    return { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) }
                },
                error: /Room .+ is full/,
                status: 400
            },
            {
                getBody: async () => {
                    const playerId = chance.string({ length: 10 })
                    const playerName = chance.string({ length: 10 })

                    const response = await postApi('createGame', { playerId, playerName })

                    const roomId = (await response.json()).roomId
                    await postApi('joinGame', { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) })
                    await postApi('startGame', { roomId, playerId })

                    return { roomId, playerId: chance.string({ length: 10 }), playerName: chance.string({ length: 10 }) }
                },
                error: 'Game has already started',
                status: 400
            },
            {
                getBody: async () => {
                    const playerId = chance.string({ length: 10 })
                    const playerName = chance.string({ length: 10 })

                    const response = await postApi('createGame', { playerId, playerName })

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

                    const response = await postApi('createGame', { playerId, playerName })

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

                    const response = await postApi('createGame', { playerId, playerName })

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
            const response = await postApi('joinGame', body)

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

    describe('resetGame', () => {
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

                    let response = await postApi('createGame', {
                        playerId: players[0].id,
                        playerName: players[0].name
                    })

                    const roomId = (await response.json()).roomId

                    await postApi('joinGame', {
                        roomId,
                        playerId: players[1].id,
                        playerName: players[1].name
                    })

                    response = await postApi('startGame', { roomId, playerId: players[0].id })

                    let gameState = await response.json() as PublicGameState
                    const turnPlayerName = gameState.turnPlayer
                    const firstPlayerIndex = gameState.players.findIndex(({ name }) => name === turnPlayerName)

                    const privatePlayers = gameState.players.map(({ name }) => ({
                        id: players.find((player) => player.name === name).id,
                        name
                    }))

                    await postApi('action', { roomId, playerId: privatePlayers[firstPlayerIndex].id, action: Actions.Tax })
                    await postApi('actionResponse', { roomId, playerId: privatePlayers[(firstPlayerIndex + 1) % privatePlayers.length].id, response: Responses.Pass })
                    await postApi('action', { roomId, playerId: privatePlayers[(firstPlayerIndex + 1) % privatePlayers.length].id, action: Actions.Income })
                    await postApi('action', { roomId, playerId: privatePlayers[(firstPlayerIndex + 2) % privatePlayers.length].id, action: Actions.Tax })
                    await postApi('actionResponse', { roomId, playerId: privatePlayers[(firstPlayerIndex + 3) % privatePlayers.length].id, response: Responses.Pass })
                    await postApi('action', { roomId, playerId: privatePlayers[(firstPlayerIndex + 3) % privatePlayers.length].id, action: Actions.Income })
                    await postApi('action', { roomId, playerId: privatePlayers[(firstPlayerIndex + 4) % privatePlayers.length].id, action: Actions.Assassinate, targetPlayer: privatePlayers[(firstPlayerIndex + 5) % privatePlayers.length].name })
                    response = await postApi('actionResponse', { roomId, playerId: privatePlayers[(firstPlayerIndex + 5) % privatePlayers.length].id, response: Responses.Pass })
                    gameState = await response.json() as PublicGameState
                    await postApi('loseInfluence', { roomId, playerId: privatePlayers[(firstPlayerIndex + 5) % privatePlayers.length].id, influence: gameState.selfPlayer.influences[0] })
                    await postApi('action', { roomId, playerId: privatePlayers[(firstPlayerIndex + 5) % privatePlayers.length].id, action: Actions.Income })
                    await postApi('action', { roomId, playerId: privatePlayers[(firstPlayerIndex + 6) % privatePlayers.length].id, action: Actions.Assassinate, targetPlayer: privatePlayers[(firstPlayerIndex + 7) % privatePlayers.length].name })
                    response = await postApi('actionResponse', { roomId, playerId: privatePlayers[(firstPlayerIndex + 7) % privatePlayers.length].id, response: Responses.Pass })
                    gameState = await response.json() as PublicGameState
                    await postApi('loseInfluence', { roomId, playerId: privatePlayers[(firstPlayerIndex + 5) % privatePlayers.length].id, influence: gameState.selfPlayer.influences[0] })

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

                    const response = await postApi('createGame', { playerId, playerName })

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

                    const response = await postApi('createGame', { playerId, playerName })

                    const roomId = (await response.json()).roomId

                    await postApi('joinGame', {
                        roomId,
                        playerId: chance.string({ length: 10 }),
                        playerName: chance.string({ length: 10 })
                    })
                    await postApi('startGame', { roomId, playerId })

                    return { roomId, playerId }
                },
                error: 'Current game is in progress',
                status: 400
            },
            {
                getBody: async () => {
                    const playerId = chance.string({ length: 10 })
                    const playerName = chance.string({ length: 10 })

                    const response = await postApi('createGame', { playerId, playerName })

                    const roomId = (await response.json()).roomId

                    await postApi('joinGame', {
                        roomId,
                        playerId: chance.string({ length: 10 }),
                        playerName: chance.string({ length: 10 })
                    })

                    return { roomId, playerId }
                },
                error: '',
                status: 200
            }
        ] as {
            getBody: () => Promise<Partial<{ roomId: string, playerId: string }>>,
            error: string,
            status: number
        }[])('should return $status $error', async ({ getBody, error, status }) => {
            const response = await postApi('resetGame', await getBody())

            expect(response.status).toBe(status)
            const responseJson = await response.json()
            if (error) {
                expect(responseJson).toEqual({ error: expect.stringMatching(error) })
            } else {
                validatePublicState(responseJson)
                expect(responseJson.players.every((player: PublicPlayer) => player.influenceCount === 2))
                expect(responseJson.isStarted).toBe(true)
            }
        })
    })

    describe('startGame', () => {
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

                    const response = await postApi('createGame', {
                        playerId: players[0].id,
                        playerName: players[0].name
                    })

                    const roomId = (await response.json()).roomId

                    await postApi('joinGame', {
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

                    const response = await postApi('createGame', { playerId, playerName })

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

                    const response = await postApi('createGame', { playerId, playerName })

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

                    const response = await postApi('createGame', { playerId, playerName })

                    const roomId = (await response.json()).roomId

                    await postApi('joinGame', {
                        roomId,
                        playerId: chance.string({ length: 10 }),
                        playerName: chance.string({ length: 10 })
                    })

                    await postApi('startGame', { roomId, playerId })

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
            const response = await postApi('startGame', await getBody())

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
