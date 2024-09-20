import http from 'http'
import express, { NextFunction, Request, Response } from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import Joi, { ObjectSchema } from 'joi'
import { Actions, Influences, Responses, PublicGameState } from '../shared/types/game'
import { actionChallengeResponseHandler, actionHandler, actionResponseHandler, blockChallengeResponseHandler, blockResponseHandler, createGameHandler, getGameStateHandler, joinGameHandler, loseInfluencesHandler, resetGameHandler, startGameHandler } from './src/game/actionHandlers'
import { GameMutationInputError } from './src/utilities/errors'
import { Server as ioServer } from 'socket.io'
import { getPublicGameState } from './src/utilities/gameState'

const port = process.env.EXPRESS_PORT || 8008

const app = express()
app.use(cors())
app.use(json())
const server = http.createServer(app)
const io = new ioServer(server, {
    cors: { origin: "*" }
})

const playerNameRule = Joi.string().min(1).max(10).disallow(
    ...Object.values(Influences),
    ...Object.values(Actions)
).required()

const validateExpressRequest = (schema: ObjectSchema, requestProperty: 'body' | 'query') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.validate(req[requestProperty], { abortEarly: false })
        if (result.error) {
            res.status(400).json({
                error: result.error.details.map(({ message }) => message).join(', ')
            })
            return
        }
        next()
    }
}
const validateExpressBody = (schema: ObjectSchema) => validateExpressRequest(schema, 'body')
const validateExpressQuery = (schema: ObjectSchema) => validateExpressRequest(schema, 'query')

const eventHandlers: {
    [event: string]: {
        handler: (args: unknown) => Promise<PublicGameState>
        express: {
            method: 'post' | 'get'
            parseParams: (req: Request) => unknown
            validator: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void
        }
        joiSchema: Joi.ObjectSchema
    }
} = {
    gameState: {
        handler: getGameStateHandler,
        joiSchema: Joi.object().keys({
            roomId: Joi.string().required(),
            playerId: Joi.string().required()
        }),
        express: {
            method: 'get',
            parseParams: (req) => {
                const roomId: string = req.query.roomId as string
                const playerId: string = req.query.playerId as string
                return { roomId, playerId }
            },
            validator: validateExpressQuery
        }
    },
    createGame: {
        handler: createGameHandler,
        express: {
            method: 'post',
            parseParams: (req) => {
                const playerId: string = req.body.playerId
                const playerName: string = req.body.playerName
                return { playerId, playerName }
            },
            validator: validateExpressBody
        },
        joiSchema: Joi.object().keys({
            playerId: Joi.string().required(),
            playerName: playerNameRule
        })
    },
    joinGame: {
        handler: joinGameHandler,
        express: {
            method: 'post',
            parseParams: (req) => {
                const roomId: string = req.body.roomId
                const playerId: string = req.body.playerId
                const playerName: string = req.body.playerName.trim()
                return { roomId, playerId, playerName }
            },
            validator: validateExpressBody
        },
        joiSchema: Joi.object().keys({
            roomId: Joi.string().required(),
            playerId: Joi.string().required(),
            playerName: playerNameRule
        })
    },
    startGame: {
        handler: startGameHandler,
        express: {
            method: 'post',
            parseParams: (req) => {
                const roomId: string = req.body.roomId
                const playerId: string = req.body.playerId
                return { roomId, playerId }
            },
            validator: validateExpressBody
        },
        joiSchema: Joi.object().keys({
            roomId: Joi.string().required(),
            playerId: Joi.string().required()
        })
    },
    resetGame: {
        handler: resetGameHandler,
        express: {
            method: 'post',
            parseParams: (req) => {
                const roomId: string = req.body.roomId
                const playerId: string = req.body.playerId
                return { roomId, playerId }
            },
            validator: validateExpressBody
        },
        joiSchema: Joi.object().keys({
            roomId: Joi.string().required(),
            playerId: Joi.string().required()
        })
    },
    action: {
        handler: actionHandler,
        express: {
            method: 'post',
            parseParams: (req) => {
                const roomId: string = req.body.roomId
                const playerId: string = req.body.playerId
                const action: Actions = req.body.action
                const targetPlayer: string | undefined = req.body.targetPlayer
                return { roomId, playerId, action, targetPlayer }
            },
            validator: validateExpressBody
        },
        joiSchema: Joi.object().keys({
            roomId: Joi.string().required(),
            playerId: Joi.string().required(),
            action: Joi.string().allow(...Object.values(Actions)).required(),
            targetPlayer: Joi.string()
        })
    },
    actionResponse: {
        handler: actionResponseHandler,
        express: {
            method: 'post',
            parseParams: (req) => {
                const roomId: string = req.body.roomId
                const playerId: string = req.body.playerId
                const response: Responses = req.body.response
                const claimedInfluence: Influences | undefined = req.body.claimedInfluence
                return { roomId, playerId, response, claimedInfluence }
            },
            validator: validateExpressBody
        },
        joiSchema: Joi.object().keys({
            roomId: Joi.string().required(),
            playerId: Joi.string().required(),
            response: Joi.string().allow(...Object.values(Responses)).required(),
            claimedInfluence: Joi.string().allow(...Object.values(Influences))
        })
    },
    actionChallengeResponse: {
        handler: actionChallengeResponseHandler,
        express: {
            method: 'post',
            parseParams: (req) => {
                const roomId: string = req.body.roomId
                const playerId: string = req.body.playerId
                const influence: Influences = req.body.influence
                return { roomId, playerId, influence }
            },
            validator: validateExpressBody
        },
        joiSchema: Joi.object().keys({
            roomId: Joi.string().required(),
            playerId: Joi.string().required(),
            influence: Joi.string().allow(...Object.values(Influences)).required()
        })
    },
    blockResponse: {
        handler: blockResponseHandler,
        express: {
            method: 'post',
            parseParams: (req) => {
                const roomId: string = req.body.roomId
                const playerId: string = req.body.playerId
                const response: Responses = req.body.response
                return { roomId, playerId, response }
            },
            validator: validateExpressBody
        },
        joiSchema: Joi.object().keys({
            roomId: Joi.string().required(),
            playerId: Joi.string().required(),
            response: Joi.string().allow(...Object.values(Responses)).required()
        })
    },
    blockChallengeResponse: {
        handler: blockChallengeResponseHandler,
        express: {
            method: 'post',
            parseParams: (req) => {
                const roomId: string = req.body.roomId
                const playerId: string = req.body.playerId
                const influence: Influences = req.body.influence
                return { roomId, playerId, influence }
            },
            validator: validateExpressBody
        },
        joiSchema: Joi.object().keys({
            roomId: Joi.string().required(),
            playerId: Joi.string().required(),
            influence: Joi.string().allow(...Object.values(Influences)).required()
        })
    },
    loseInfluences: {
        handler: loseInfluencesHandler,
        express: {
            method: 'post',
            parseParams: (req) => {
                const roomId: string = req.body.roomId
                const playerId: string = req.body.playerId
                const influences: Influences[] = req.body.influences
                return { roomId, playerId, influences }
            },
            validator: validateExpressBody
        },
        joiSchema: Joi.object().keys({
            roomId: Joi.string().required(),
            playerId: Joi.string().required(),
            influences: Joi.array().items(
                Joi.string().allow(...Object.values(Influences)).required()
            ).min(1).max(2).required()
        })
    }
}

io.on('connection', (socket) => {
    Object.entries(eventHandlers).forEach(([event, { handler, joiSchema }]) => {
        socket.on(event, async (params) => {
            const result = joiSchema.validate(params)

            if (result.error) {
                socket.emit('error', result.error.details.map(({ message }) => message).join(', '))
            } else {
                try {
                    const gameState = await handler(params)
                    if (!socket.data.playerId && gameState.selfPlayer.id) {
                        socket.data.playerId = gameState.selfPlayer.id
                    }
                    const roomPrefix = 'coup-game-'
                    socket.emit('gameStateChanged', gameState)
                    const socketRoom = `${roomPrefix}${gameState.roomId}`
                    if (![...socket.rooms].some((room) => room.startsWith(roomPrefix)) && gameState.roomId) {
                        console.log(`socket ${socket.id} joined room ${socketRoom}`)
                        await socket.join(socketRoom)
                    }
                    if (event !== 'gameState') {
                        socket.rooms.forEach(async (room) => {
                            if (room.startsWith(roomPrefix)) {
                                const roomSockets = await io.in(room).fetchSockets()
                                roomSockets.forEach(async (otherSocket) => {
                                    if (otherSocket.id !== socket.id) {
                                        otherSocket.emit('gameStateChanged', await getPublicGameState(gameState.roomId, otherSocket.data.playerId))
                                    }
                                })
                            }
                        })
                    }
                } catch (error) {
                    if (error instanceof GameMutationInputError) {
                        socket.emit('error', error.message)
                    } else {
                        socket.emit('error', 'Unexpected error processing request')
                    }
                }
            }
        })
    })
})

type PublicGameStateOrError = PublicGameState | { error: string }

const responseHandler = <T>(handler: (props: T) =>
    Promise<PublicGameState>) => async (res: Response<PublicGameStateOrError>, props: T) => {
        try {
            res.status(200).json(await handler(props))
        } catch (error) {
            if (error instanceof GameMutationInputError) {
                res.status(error.httpCode).json({ error: error.message })
            } else {
                throw error
            }
        }
    }

Object.entries(eventHandlers).forEach(([event, { express, handler, joiSchema }]) => {
    app[express.method](`/${event}`, express.validator(joiSchema), (req, res) =>
        responseHandler(handler)(res, express.parseParams(req))
    )
})

server.listen(port, function () {
    console.log(`listening on ${port}`)
})
