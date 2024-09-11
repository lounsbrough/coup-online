import Chance from 'chance'

const chance = new Chance()

describe('index', () => {
    describe('createGame', () => {
        it('should create and return game', async () => {
            const playerName = chance.string({ length: 10 })
            const response = await fetch('http://localhost:8008/createGame', {
                method: 'post',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    playerId: chance.string(),
                    playerName: playerName
                })
            })

            expect(response.status).toBe(200)
            expect(await response.json()).toStrictEqual(expect.objectContaining({
                players: [expect.objectContaining({
                    name: playerName
                })]
            }))
        })
    })
})
