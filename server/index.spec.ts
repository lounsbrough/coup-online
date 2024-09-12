import Chance from 'chance'
import { Actions, Influences } from '../shared/types/game'

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

describe('index', () => {
    describe('gameState', () => {
        it('should return 200 and public game state', async () => {
            const playerId = chance.string()
            const playerName = chance.string({ length: 10 })

            let response = await postApi('createGame', { playerId, playerName })

            const roomId = (await response.json()).roomId

            response = await getApi(`gameState?roomId=${roomId}&playerId=${playerId}`)

            expect(response.status).toBe(200)
            const responseJson = await response.json()
            expect(responseJson.selfPlayer.name).toBe(playerName)
        })
    })

    describe('createGame', () => {
        it('should return 200 and public game state', async () => {
            const playerName = chance.string({ length: 10 })
            const response = await postApi('createGame', {
                playerId: chance.string(),
                playerName
            })

            expect(response.status).toBe(200)
            expect((await response.json()).selfPlayer.name).toBe(playerName)
        })

        it.each([
            {
                body: { playerName: chance.string({ length: 10 }) },
                error: 'playerId and playerName are required'
            },
            {
                body: { playerId: chance.string({ length: 10 }) },
                error: 'playerId and playerName are required'
            },
            {
                body: {
                    playerId: chance.string({ length: 10 }),
                    playerName: chance.string({ length: 11 })
                }, error: 'playerName must be 10 characters or less'
            },
            {
                body: {
                    playerId: chance.string({ length: 10 }),
                    playerName: Influences.Duke
                }, error: 'You may not choose the name of an influence'
            },
            {
                body: {
                    playerId: chance.string({ length: 10 }),
                    playerName: Actions.Exchange
                }, error: 'You may not choose the name of an action'
            }
        ])('should return error: "$error"', async ({ body, error }) => {
            const response = await postApi('createGame', body)

            expect(response.status).toBe(400)
            expect((await response.json())).toEqual({ error })
        })
    })

    describe('resetGame', () => {
        it('should return 200 and public game state', async () => {
            const playerId = chance.string()
            const playerName = chance.string({ length: 10 })

            let response = await postApi('createGame', { playerId, playerName })

            const roomId = (await response.json()).roomId

            response = await postApi('resetGame', { roomId, playerId })

            expect(response.status).toBe(200)
            expect((await response.json()).selfPlayer.name).toBe(playerName)
        })

        const nonExistentRoomId = chance.string({ length: 10 })

        it.each([
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
                    roomId: nonExistentRoomId,
                    playerId: chance.string({ length: 10 })
                }),
                error: `Room ${nonExistentRoomId} does not exist`,
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
            const body = await getBody()

            const response = await postApi('resetGame', body)

            expect(response.status).toBe(status)
            if (error) {
                expect((await response.json())).toEqual({ error })
            }
        })
    })
})
