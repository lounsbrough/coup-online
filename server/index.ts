import http from 'node:http'
import express, { NextFunction, Request, Response } from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import Joi, { ObjectSchema } from 'joi'
import { Actions, Influences, Responses, DehydratedPublicGameState, PlayerActions, ServerEvents, AiPersonality, GameSettings } from '../shared/types/game'
import { actionChallengeResponseHandler, actionHandler, actionResponseHandler, addAiPlayerHandler, blockChallengeResponseHandler, blockResponseHandler, checkAutoMoveHandler, createGameHandler, setChatMessageDeletedHandler, getGameStateHandler, joinGameHandler, loseInfluencesHandler, removeFromGameHandler, resetGameHandler, resetGameRequestCancelHandler, resetGameRequestHandler, sendChatMessageHandler, startGameHandler, setEmojiOnChatMessageHandler, forfeitGameHandler } from './src/game/actionHandlers'
import { GameMutationInputError, WrongPlayerIdOnSocketError } from './src/utilities/errors'
import { Server as ioServer, Socket } from 'socket.io'
import { getGameState, getPublicGameState } from './src/utilities/gameState'
import { getObjectEntries } from './src/utilities/object'
import { dehydratePublicGameState } from '../shared/helpers/state'
import { AvailableLanguageCode } from '../shared/i18n/availableLanguages'
import { translate } from './src/i18n/translations'

export type DehydratedPublicGameStateOrError = { gameState: DehydratedPublicGameState, error?: never } | { error: string, gameState?: never }

type ServerToClientEvents = {
  [ServerEvents.gameStateChanged]: (gameState: DehydratedPublicGameState) => void
  [ServerEvents.error]: (error: string) => void
}

type ClientToServerEvents = {
  [action in PlayerActions]: (
    params: { language: AvailableLanguageCode } & Record<string, unknown>,
    callback?: (response: DehydratedPublicGameStateOrError) => void
  ) => Promise<void>
}

type InterServerEvents = object

type SocketData = { playerId: string }

const genericErrorMessage = 'Unexpected error processing request'

const port = process.env.EXPRESS_PORT || 8008

const app = express()
app.use(cors())
app.use(json())
const server = http.createServer(app)
const io = new ioServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
  cors: { origin: "*" }
})

const playerNameRule = Joi.string().min(1).max(10).required()
const languageRule = Joi.string().valid(...Object.values(AvailableLanguageCode)).required()

const validateExpressRequest = (schema: ObjectSchema, requestProperty: 'body' | 'query') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.validate(req[requestProperty], { abortEarly: false })
    if (result.error) {
      res.status(400).json({
        error: translate({ key: 'invalidUserRequest', language: req[requestProperty].language ?? AvailableLanguageCode['en-US'] })
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
    handler: (args: unknown) => Promise<{ roomId: string, playerId: string, stateUnchanged?: boolean }>
    express: {
      method: 'post' | 'get'
      parseParams: (req: Request) => { language: AvailableLanguageCode } & Record<string, unknown>
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
        const language: AvailableLanguageCode = req.query.language as AvailableLanguageCode
        return { roomId, playerId, language }
      },
      validator: validateExpressQuery
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      language: languageRule
    })
  },
  [PlayerActions.createGame]: {
    handler: createGameHandler,
    express: {
      method: 'post',
      parseParams: (req) => {
        const playerId: string = req.body.playerId
        const playerName: string = req.body.playerName
        const settings: GameSettings = req.body.settings
        const language: AvailableLanguageCode = req.body.language
        return { playerId, playerName, settings, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      playerId: Joi.string().required(),
      playerName: playerNameRule,
      settings: Joi.object().keys({
        eventLogRetentionTurns: Joi.number().integer().min(1).max(100).required(),
        allowRevive: Joi.bool().required(),
        speedRoundSeconds: Joi.number().integer().min(1).max(60)
      }).required(),
      language: languageRule
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
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, playerName, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      playerName: playerNameRule,
      language: languageRule
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
        const personality: AiPersonality | undefined = req.body.personality
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, playerName, personality, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      playerName: playerNameRule,
      personality: Joi.object().keys({
        vengefulness: Joi.number().integer().min(0).max(100).required(),
        honesty: Joi.number().integer().min(0).max(100).required(),
        skepticism: Joi.number().integer().min(0).max(100).required()
      }),
      language: languageRule
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
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, playerName, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      playerName: playerNameRule,
      language: languageRule
    })
  },
  [PlayerActions.startGame]: {
    handler: startGameHandler,
    express: {
      method: 'post',
      parseParams: (req) => {
        const roomId: string = req.body.roomId
        const playerId: string = req.body.playerId
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      language: languageRule
    })
  },
  [PlayerActions.resetGameRequest]: {
    handler: resetGameRequestHandler,
    express: {
      method: 'post',
      parseParams: (req) => {
        const roomId: string = req.body.roomId
        const playerId: string = req.body.playerId
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      language: languageRule
    })
  },
  [PlayerActions.resetGameRequestCancel]: {
    handler: resetGameRequestCancelHandler,
    express: {
      method: 'post',
      parseParams: (req) => {
        const roomId: string = req.body.roomId
        const playerId: string = req.body.playerId
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      language: languageRule
    })
  },
  [PlayerActions.resetGame]: {
    handler: resetGameHandler,
    express: {
      method: 'post',
      parseParams: (req) => {
        const roomId: string = req.body.roomId
        const playerId: string = req.body.playerId
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      language: languageRule
    })
  },
  [PlayerActions.forfeit]: {
    handler: forfeitGameHandler,
    express: {
      method: 'post',
      parseParams: (req) => {
        const roomId: string = req.body.roomId
        const playerId: string = req.body.playerId
        const replaceWithAi: boolean = req.body.replaceWithAi
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, replaceWithAi, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      replaceWithAi: Joi.bool().required(),
      language: languageRule
    })
  },
  [PlayerActions.checkAutoMove]: {
    handler: checkAutoMoveHandler,
    express: {
      method: 'get',
      parseParams: (req) => {
        const roomId: string = req.query.roomId as string
        const playerId: string = req.query.playerId as string
        const language: AvailableLanguageCode = req.query.language as AvailableLanguageCode
        return { roomId, playerId, language }
      },
      validator: validateExpressQuery
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      language: languageRule
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
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, action, targetPlayer, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      action: Joi.string().allow(...Object.values(Actions)).required(),
      targetPlayer: Joi.string(),
      language: languageRule
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
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, response, claimedInfluence, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      response: Joi.string().allow(...Object.values(Responses)).required(),
      claimedInfluence: Joi.string().allow(...Object.values(Influences)),
      language: languageRule
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
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, influence, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      influence: Joi.string().allow(...Object.values(Influences)).required(),
      language: languageRule
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
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, response, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      response: Joi.string().allow(...Object.values(Responses)).required(),
      language: languageRule
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
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, influence, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      influence: Joi.string().allow(...Object.values(Influences)).required(),
      language: languageRule
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
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, influences, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      influences: Joi.array().items(
        Joi.string().allow(...Object.values(Influences)).required()
      ).min(1).max(2).required(),
      language: languageRule
    })
  },
  [PlayerActions.sendChatMessage]: {
    handler: sendChatMessageHandler,
    express: {
      method: 'post',
      parseParams: (req) => {
        const roomId: string = req.body.roomId
        const playerId: string = req.body.playerId
        const messageId: string = req.body.messageId
        const messageText: string = req.body.messageText.trim()
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, messageId, messageText, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      messageId: Joi.string().guid().required(),
      messageText: Joi.string().required().max(500),
      language: languageRule
    })
  },
  [PlayerActions.setChatMessageDeleted]: {
    handler: setChatMessageDeletedHandler,
    express: {
      method: 'post',
      parseParams: (req) => {
        const roomId: string = req.body.roomId
        const playerId: string = req.body.playerId
        const messageId: string = req.body.messageId
        const deleted: boolean = req.body.deleted
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, messageId, deleted, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      messageId: Joi.string().guid().required(),
      deleted: Joi.bool().required(),
      language: languageRule
    })
  },
  [PlayerActions.setEmojiOnChatMessage]: {
    handler: setEmojiOnChatMessageHandler,
    express: {
      method: 'post',
      parseParams: (req) => {
        const roomId: string = req.body.roomId
        const playerId: string = req.body.playerId
        const messageId: string = req.body.messageId
        const emoji: string = req.body.emoji
        const selected: boolean = req.body.selected
        const language: AvailableLanguageCode = req.body.language
        return { roomId, playerId, messageId, emoji, selected, language }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      messageId: Joi.string().guid().required(),
      emoji: Joi.string().required().max(20),
      selected: Joi.bool().required(),
      language: languageRule
    })
  }
}

io.on('connection', (socket) => {
  getObjectEntries(eventHandlers).forEach(([event, { handler, joiSchema }]) => {
    socket.on(event, async (params, callback) => {
      const result = joiSchema.validate(params, { abortEarly: false })

      if (result.error) {
        const error = translate({ key: 'invalidUserRequest', language: params.language ?? AvailableLanguageCode['en-US'] })
        socket.emit(ServerEvents.error, error)
        callback?.({ error })
      } else {
        try {
          const { roomId, playerId, stateUnchanged } = await handler(params)
          if (!socket.data.playerId && playerId) {
            socket.data.playerId = playerId
          }
          if (playerId !== socket.data.playerId) {
            throw new WrongPlayerIdOnSocketError()
          }
          const roomPrefix = 'coup-game-'
          const socketRoom = `${roomPrefix}${roomId}`
          const currentRooms = [...socket.rooms]
          if (roomId && !currentRooms.includes(socketRoom)) {
            await Promise.all(currentRooms.map((currentRoom) => socket.leave(currentRoom)))
            await socket.join(socketRoom)
          }
          const fullGameState = await getGameState(roomId)
          const emitGameStateChanged = async (pushToSocket: Socket) => {
            const isCallerSocket = pushToSocket.data.playerId === playerId
            try {
              const publicGameState = dehydratePublicGameState(getPublicGameState({ gameState: fullGameState, playerId: pushToSocket.data.playerId }))
              pushToSocket.emit(ServerEvents.gameStateChanged, publicGameState)
              if (isCallerSocket) callback?.({ gameState: publicGameState })
            } catch (error) {
              console.error(error, { event, params })
              if (event === PlayerActions.checkAutoMove) return

              if (error instanceof GameMutationInputError) {
                const message = error.getMessage(params.language)
                pushToSocket.emit(ServerEvents.error, message)
                if (isCallerSocket) callback?.({ error: message })
              } else {
                pushToSocket.emit(ServerEvents.error, genericErrorMessage)
                if (isCallerSocket) callback?.({ error: genericErrorMessage })
              }
            }
          }

          if (stateUnchanged) {
            return
          }

          if (event === PlayerActions.gameState) {
            await emitGameStateChanged(socket)
          } else {
            const roomSocketIds = io.of('/').adapter.rooms.get(socketRoom)
            if (roomSocketIds) {
              const roomSockets = [...roomSocketIds].map((socketId) => io.sockets.sockets.get(socketId))
              roomSockets.forEach(emitGameStateChanged)
            }
          }
        } catch (error) {
          console.error(error, { event, params })
          if (event === PlayerActions.checkAutoMove) return

          if (error instanceof GameMutationInputError) {
            const message = error.getMessage(params.language)
            socket.emit(ServerEvents.error, message)
            callback?.({ error: message })
          } else {
            socket.emit(ServerEvents.error, genericErrorMessage)
            callback?.({ error: genericErrorMessage })
          }
        }
      }
    })
  })
})

const responseHandler = <T>(
  event: PlayerActions,
  handler: (props: T) => Promise<{ roomId: string, playerId: string }>
) => async (res: Response<DehydratedPublicGameStateOrError>, props: { language: AvailableLanguageCode } & T) => {
  try {
    const { roomId, playerId } = await handler(props)
    const publicGameState = dehydratePublicGameState(getPublicGameState({
      gameState: await getGameState(roomId),
      playerId
    }))
    res.status(200).json({ gameState: publicGameState })
  } catch (error) {
    console.error(error, { event, props })
    if (event === PlayerActions.checkAutoMove) return

    if (error instanceof GameMutationInputError) {
      const message = error.getMessage(props.language)
      res.status(error.httpCode || 400).send({ error: message })
    } else {
      res.status(500).send({ error: genericErrorMessage })
    }
  }
}

getObjectEntries(eventHandlers).forEach(([event, { express, handler, joiSchema }]) => {
  app[express.method](`/${event}`, express.validator(joiSchema), (req, res) => {
    return responseHandler(event, handler)(res, express.parseParams(req))
  })
})

server.listen(port, function () {
  console.log(`listening on ${port}`)
})
