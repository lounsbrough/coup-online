import http from 'http'
import express, { NextFunction, Request, Response } from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import Joi, { ObjectSchema } from 'joi'
import { Actions, Influences, Responses, PublicGameState, PlayerActions, ServerEvents, ActionAttributes } from '../shared/types/game'
import { actionChallengeResponseHandler, actionHandler, actionResponseHandler, addAiPlayerHandler, blockChallengeResponseHandler, blockResponseHandler, createGameHandler, getGameStateHandler, joinGameHandler, loseInfluencesHandler, removeFromGameHandler, resetGameHandler, resetGameRequestCancelHandler, resetGameRequestHandler, startGameHandler } from './src/game/actionHandlers'
import { GameMutationInputError } from './src/utilities/errors'
import { Server as ioServer, Socket } from 'socket.io'
import { getGameState, getPublicGameState } from './src/utilities/gameState'
import { getObjectEntries } from './src/utilities/object'

export type PublicGameStateOrError = { gameState: PublicGameState, error?: never } | { error: string, gameState?: never }

type ServerToClientEvents = {
  [ServerEvents.gameStateChanged]: (gameState: PublicGameState) => void
  [ServerEvents.error]: (error: string) => void
}

type ClientToServerEvents = {
  [action in PlayerActions]: (
    params: unknown,
    callback?: (response: PublicGameStateOrError) => void
  ) => Promise<void>
}

type InterServerEvents = object

type SocketData = { playerId: string }

const port = process.env.EXPRESS_PORT || 8008

const app = express()
app.use(cors())
app.use(json())
const server = http.createServer(app)
const io = new ioServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
  cors: { origin: "*" }
})

const playerNameRule = Joi.string().min(1).max(10).disallow(
  ...Object.values(Influences),
  ...Object.values(Actions),
  ...Object.values(ActionAttributes).flatMap(({ wordVariations }) => wordVariations ?? [])
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
  [event in PlayerActions]: {
    handler: (args: unknown) => Promise<{ roomId: string, playerId: string }>
    express: {
      method: 'post' | 'get'
      parseParams: (req: Request) => unknown
      validator: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void
    }
    joiSchema: Joi.ObjectSchema
  }
} = {
  [PlayerActions.gameState]: {
    handler: getGameStateHandler,
    express: {
      method: 'get',
      parseParams: (req) => {
        const roomId: string = req.query.roomId as string
        const playerId: string = req.query.playerId as string
        return { roomId, playerId }
      },
      validator: validateExpressQuery
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required()
    })
  },
  [PlayerActions.createGame]: {
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
  [PlayerActions.joinGame]: {
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
  [PlayerActions.addAiPlayer]: {
    handler: addAiPlayerHandler,
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
  [PlayerActions.removeFromGame]: {
    handler: removeFromGameHandler,
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
  [PlayerActions.startGame]: {
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
  [PlayerActions.resetGameRequest]: {
    handler: resetGameRequestHandler,
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
  [PlayerActions.resetGameRequestCancel]: {
    handler: resetGameRequestCancelHandler,
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
  [PlayerActions.resetGame]: {
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
  [PlayerActions.checkAiMove]: {
    handler: actionHandler,
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
  [PlayerActions.action]: {
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
  [PlayerActions.actionResponse]: {
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
  [PlayerActions.actionChallengeResponse]: {
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
  [PlayerActions.blockResponse]: {
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
  [PlayerActions.blockChallengeResponse]: {
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
  [PlayerActions.loseInfluences]: {
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
  getObjectEntries(eventHandlers).forEach(([event, { handler, joiSchema }]) => {
    socket.on(event, async (params, callback) => {
      const result = joiSchema.validate(params, { abortEarly: false })
      const genericErrorMessage = 'Unexpected error processing request'

      if (result.error) {
        const error = result.error.details.map(({ message }) => message).join(', ')
        socket.emit(ServerEvents.error, error)
        callback?.({ error })
      } else {
        try {
          const { roomId, playerId } = await handler(params)
          if (!socket.data.playerId && playerId) {
            socket.data.playerId = playerId
          }
          if (playerId !== socket.data.playerId) {
            throw new GameMutationInputError('playerId does not match socket')
          }
          const roomPrefix = 'coup-game-'
          const socketRoom = `${roomPrefix}${roomId}`
          if (![...socket.rooms].some((room) => room.startsWith(roomPrefix)) && roomId) {
            await socket.join(socketRoom)
          }
          const fullGameState = await getGameState(roomId)
          const emitGameStateChanged = async (pushToSocket: Socket) => {
            const isCallerSocket = pushToSocket.data.playerId === playerId
            try {
              const publicGameState = await getPublicGameState({ gameState: fullGameState, playerId: pushToSocket.data.playerId })
              pushToSocket.emit(ServerEvents.gameStateChanged, publicGameState)
              if (isCallerSocket) callback?.({ gameState: publicGameState })
            } catch (error) {
              if (error instanceof GameMutationInputError) {
                if (error.httpCode >= 500 && error.httpCode <= 599) {
                  console.error(error)
                }
                pushToSocket.emit(ServerEvents.error, error.message)
                if (isCallerSocket) callback?.({ error: error.message })
              } else {
                console.error(error)
                pushToSocket.emit(ServerEvents.error, genericErrorMessage)
                if (isCallerSocket) callback?.({ error: genericErrorMessage })
              }
            }
          }
          if (event !== PlayerActions.gameState) {
            const roomSocketIds = io.of('/').adapter.rooms.get(socketRoom)
            if (roomSocketIds) {
              const roomSockets = [...roomSocketIds].map((socketId) => io.sockets.sockets.get(socketId))
              roomSockets.forEach(emitGameStateChanged)
            }
          } else {
            await emitGameStateChanged(socket)
          }
        } catch (error) {
          if (error instanceof GameMutationInputError) {
            if (error.httpCode >= 500 && error.httpCode <= 599) {
              console.error(error)
            }
            socket.emit(ServerEvents.error, error.message)
            callback?.({ error: error.message })
          } else {
            console.error(error)
            socket.emit(ServerEvents.error, genericErrorMessage)
            callback?.({ error: genericErrorMessage })
          }
        }
      }
    })
  })
})

const responseHandler = <T>(handler: (props: T) =>
  Promise<{ roomId: string, playerId: string }>) => async (res: Response<PublicGameStateOrError>, props: T) => {
    try {
      const publicGameState = await getPublicGameState(await handler(props))
      res.status(200).json({ gameState: publicGameState })
    } catch (error) {
      if (error instanceof GameMutationInputError) {
        res.status(error.httpCode).send({ error: error.message })
      } else {
        res.status(500).send({ error: 'Unexpected error processing request' })
      }
    }
  }

getObjectEntries(eventHandlers).forEach(([event, { express, handler, joiSchema }]) => {
  app[express.method](`/${event}`, express.validator(joiSchema), (req, res) => {
    return responseHandler(handler)(res, express.parseParams(req))
  })
})

server.listen(port, function () {
  console.log(`listening on ${port}`)
})
