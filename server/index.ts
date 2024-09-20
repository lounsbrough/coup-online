import http from 'http'
import express, { NextFunction, Request, Response } from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import Joi, { ObjectSchema } from 'joi'
import { Actions, Influences, Responses, PublicGameState } from '../shared/types/game'
import { actionChallengeResponseHandler, actionHandler, actionResponseHandler, blockChallengeResponseHandler, blockResponseHandler, createGameHandler, getGameStateHandler, joinGameHandler, loseInfluencesHandler, resetGameHandler, startGameHandler } from './src/game/actionHandlers'
import { GameMutationInputError } from './src/utilities/errors'
import { Server as ioServer } from 'socket.io'

const port = process.env.EXPRESS_PORT || 8008

const app = express()
app.use(cors())
app.use(json())
const server = http.createServer(app)
const io = new ioServer(server, {
    cors: { origin: "*" }
})

io.on('connection', () => {
    console.log('connected')
})

const playerNameRule = Joi.string().min(1).max(10).disallow(
    ...Object.values(Influences),
    ...Object.values(Actions)
).required()

const validateRequest = (schema: ObjectSchema, requestProperty: 'body' | 'query') => {
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
const validateBody = (schema: ObjectSchema) => validateRequest(schema, 'body')
const validateQuery = (schema: ObjectSchema) => validateRequest(schema, 'query')

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

app.get('/gameState', validateQuery(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required()
})), (async (req, res) => {
    const roomId: string = req.query.roomId as string
    const playerId: string = req.query.playerId as string

    await responseHandler(getGameStateHandler)(res, { roomId, playerId })
}))

app.post('/createGame', validateBody(Joi.object().keys({
    playerId: Joi.string().required(),
    playerName: playerNameRule
})), async (req, res) => {
    const playerId: string = req.body.playerId
    const playerName: string = req.body.playerName

    await responseHandler(createGameHandler)(res, { playerId, playerName })
})

app.post('/joinGame', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    playerName: playerNameRule
})), async (req, res) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const playerName: string = req.body.playerName.trim()

    await responseHandler(joinGameHandler)(res, { roomId, playerId, playerName })
})

app.post('/resetGame', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required()
})), async (req, res) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId

    await responseHandler(resetGameHandler)(res, { roomId, playerId })
})

app.post('/startGame', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required()
})), async (req, res) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId

    await responseHandler(startGameHandler)(res, { roomId, playerId })
})

app.post('/action', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    action: Joi.string().allow(...Object.values(Actions)).required(),
    targetPlayer: Joi.string()
})), async (req, res) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const action: Actions = req.body.action
    const targetPlayer: string | undefined = req.body.targetPlayer

    await responseHandler(actionHandler)(res, { roomId, playerId, action, targetPlayer })
})

app.post('/actionResponse', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    response: Joi.string().allow(...Object.values(Responses)).required(),
    claimedInfluence: Joi.string().allow(...Object.values(Influences))
})), async (req, res) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const response: Responses = req.body.response
    const claimedInfluence: Influences | undefined = req.body.claimedInfluence

    await responseHandler(actionResponseHandler)(res, { roomId, playerId, response, claimedInfluence })
})

app.post('/actionChallengeResponse', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    influence: Joi.string().allow(...Object.values(Influences)).required()
})), async (req, res) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const influence: Influences = req.body.influence

    await responseHandler(actionChallengeResponseHandler)(res, { roomId, playerId, influence })
})

app.post('/blockResponse', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    response: Joi.string().allow(...Object.values(Responses)).required()
})), async (req, res) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const response: Responses = req.body.response

    await responseHandler(blockResponseHandler)(res, { roomId, playerId, response })
})

app.post('/blockChallengeResponse', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    influence: Joi.string().allow(...Object.values(Influences)).required()
})), async (req, res) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const influence: Influences = req.body.influence

    await responseHandler(blockChallengeResponseHandler)(res, { roomId, playerId, influence })
})

app.post('/loseInfluences', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    influences: Joi.array().items(
        Joi.string().allow(...Object.values(Influences)).required()
    ).min(1).max(2).required()
})), async (req, res) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const influences: Influences[] = req.body.influences

    await responseHandler(loseInfluencesHandler)(res, { roomId, playerId, influences })
})

server.listen(port, function () {
    console.log(`listening on ${port}`)
})
