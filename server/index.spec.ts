import Chance from 'chance'
import { Actions, GameState, Influences, Player, PublicGameState, PublicPlayer } from '../shared/types/game'

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
                    const playerId = chance.string()
                    const playerName = chance.string({ length: 10 })

                    const response = await postApi('createGame', { playerId, playerName })

                    const roomId = (await response.json()).roomId

                    return { roomId, playerId }
                },
                error: '',
                status: 200
            },
            {
                getQueryParams: () => ({ playerId: chance.string({ length: 10 }) }),
                error: 'roomId and playerId are required',
                status: 400
            },
            {
                getQueryParams: () => ({ roomId: chance.string({ length: 10 }) }),
                error: 'roomId and playerId are required',
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
                    const playerId = chance.string()
                    const playerName = chance.string({ length: 10 })

                    const response = await postApi('createGame', { playerId, playerName })

                    const roomId = (await response.json()).roomId

                    return { roomId, playerId: chance.string({ length: 10 }) }
                },
                error: 'Player not in game',
                status: 400
            }
        ])('should return $status $error', async ({ getQueryParams, error, status }) => {
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
                body: { playerName: chance.string({ length: 10 }) },
                error: 'playerId and playerName are required',
                status: 400
            },
            {
                body: { playerId: chance.string({ length: 10 }) },
                error: 'playerId and playerName are required',
                status: 400
            },
            {
                body: {
                    playerId: chance.string({ length: 10 }),
                    playerName: chance.string({ length: 11 })
                },
                error: 'playerName must be 10 characters or less',
                status: 400
            },
            {
                body: {
                    playerId: chance.string({ length: 10 }),
                    playerName: Influences.Duke
                },
                error: 'You may not choose the name of an influence',
                status: 400
            },
            {
                body: {
                    playerId: chance.string({ length: 10 }),
                    playerName: Actions.Exchange
                },
                error: 'You may not choose the name of an action',
                status: 400
            }
        ])('should return $status $error', async ({ body, error, status }) => {
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

    describe('resetGame', () => {
        it.each([
            {
                getBody: async () => {
                    const playerId = chance.string()
                    const playerName = chance.string({ length: 10 })

                    const response = await postApi('createGame', { playerId, playerName })

                    const roomId = (await response.json()).roomId

                    return { roomId, playerId }
                },
                error: '',
                status: 200
            },
            {
                getBody: () => ({ playerId: chance.string({ length: 10 }) }),
                error: 'roomId and playerId are required',
                status: 400
            },
            {
                getBody: () => ({ roomId: chance.string({ length: 10 }) }),
                error: 'roomId and playerId are required',
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
                    const playerId = chance.string()
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
                    const playerId = chance.string()
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
                    const playerId = chance.string()
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
        ])('should return $status $error', async ({ getBody, error, status }) => {
            const response = await postApi('resetGame', (await getBody()))

            expect(response.status).toBe(status)
            const responseJson = await response.json()
            if (error) {
                expect(responseJson).toEqual({ error: expect.stringMatching(error) })
            } else {
                validatePublicState(responseJson)
            }
        })
    })
})
