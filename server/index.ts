import http from 'node:http'
import express, { NextFunction, Request, Response } from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import Joi, { ObjectSchema } from 'joi'
import rateLimit from 'express-rate-limit'
import { Actions, Influences, Responses, DehydratedPublicGameState, PlayerActions, ServerEvents, AiPersonality, GameSettings, GameState } from '../shared/types/game'
import { actionChallengeResponseHandler, actionHandler, actionResponseHandler, addAiPlayerHandler, blockChallengeResponseHandler, blockResponseHandler, checkAutoMoveHandler, createGameHandler, setChatMessageDeletedHandler, getGameStateHandler, joinGameHandler, loseInfluencesHandler, removeFromGameHandler, resetGameHandler, resetGameRequestCancelHandler, resetGameRequestHandler, sendChatMessageHandler, startGameHandler, setEmojiOnChatMessageHandler, forfeitGameHandler } from './src/game/actionHandlers'
import { GameMutationInputError, WrongPlayerIdOnSocketError } from './src/utilities/errors'
import { Server as ioServer, Socket } from 'socket.io'
import { getPublicGameState } from './src/utilities/gameState'
import { getObjectEntries } from './src/utilities/object'
import { dehydratePublicGameState } from '../shared/helpers/state'
import { AvailableLanguageCode } from '../shared/i18n/availableLanguages'
import { translate } from './src/i18n/translations'
import { getUserStats, getLeaderboard, getDisplayName, setDisplayName, deleteUserStats } from './src/utilities/stats'
import { verifyIdToken } from './src/auth'
import { adminAuth } from './src/firebase'
import { containsProfanity } from './src/utilities/profanity'
import { constructWebhookEvent, createCheckoutSession, handleCheckoutSessionCompleted } from './src/utilities/stripe'
import { getUserMonetizationHistory, getUserPremiumStatus, grantPremiumAccess, recordMonetizationHistory } from './src/utilities/monetization'

export type DehydratedPublicGameStateOrError = { gameState: DehydratedPublicGameState, serverTime: string, error?: never } | { error: string, gameState?: never, serverTime?: never }

type ServerToClientEvents = {
  [ServerEvents.gameStateChanged]: (payload: { gameState: DehydratedPublicGameState, serverTime: string }) => void
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
type RequestWithRawBody = Request & { rawBody?: Buffer }

const genericErrorMessage = 'Unexpected error processing request'

const port = process.env.EXPRESS_PORT || 8008

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

const app = express()
app.use(cors())
app.use(json({
  verify: (req, _res, buf) => {
    if (req.url === '/api/payments/webhook') {
      (req as RequestWithRawBody).rawBody = Buffer.from(buf)
    }
  },
}))
const server = http.createServer(app)
const io = new ioServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
  cors: { origin: "*" }
})

const playerNameRule = Joi.string().min(1).max(10).required().custom((value: string) => {
  if (containsProfanity(value)) {
    throw new Error('inappropriateDisplayName')
  }
  return value
})
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (args: any) => Promise<{ roomId: string, playerId: string, stateUnchanged?: boolean, gameState: GameState }>
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
        const uid: string | undefined = req.body.uid
        const photoURL: string | undefined = req.body.photoURL
        return { playerId, playerName, settings, language, uid, photoURL }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      playerId: Joi.string().required(),
      playerName: playerNameRule,
      settings: Joi.object().keys({
        eventLogRetentionTurns: Joi.number().integer().min(1).max(100).required(),
        allowRevive: Joi.bool().required(),
        aiMoveDelayMs: Joi.number().integer().min(0).max(10000),
        speedRoundSeconds: Joi.number().integer().min(5).max(60)
      }).required(),
      language: languageRule,
      uid: Joi.string().optional(),
      photoURL: Joi.string().uri().optional()
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
        const uid: string | undefined = req.body.uid
        const photoURL: string | undefined = req.body.photoURL
        return { roomId, playerId, playerName, language, uid, photoURL }
      },
      validator: validateExpressBody
    },
    joiSchema: Joi.object().keys({
      roomId: Joi.string().required(),
      playerId: Joi.string().required(),
      playerName: playerNameRule,
      language: languageRule,
      uid: Joi.string().optional(),
      photoURL: Joi.string().uri().optional()
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
          const { roomId, playerId, stateUnchanged, gameState } = await handler(params)
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

          if (stateUnchanged) {
            return
          }

          const fullGameState = gameState

          const emitGameStateChanged = async (pushToSocket: Socket) => {
            const isCallerSocket = pushToSocket.data.playerId === playerId
            try {
              const publicGameState = dehydratePublicGameState(getPublicGameState({ gameState: fullGameState, playerId: pushToSocket.data.playerId }))
              const serverTime = new Date().toISOString()
              pushToSocket.emit(ServerEvents.gameStateChanged, { gameState: publicGameState, serverTime })
              if (isCallerSocket) callback?.({ gameState: publicGameState, serverTime })
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

          if (event === PlayerActions.gameState) {
            await emitGameStateChanged(socket)
          } else {
            const roomSocketIds = io.of('/').adapter.rooms.get(socketRoom)
            if (roomSocketIds) {
              const roomSockets = [...roomSocketIds].map((socketId) => io.sockets.sockets.get(socketId)).filter((s) => s !== undefined)
              await Promise.all(roomSockets.map(emitGameStateChanged))
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
  handler: (props: T) => Promise<{ roomId: string, playerId: string, gameState: GameState }>
) => async (res: Response<DehydratedPublicGameStateOrError>, props: { language: AvailableLanguageCode } & T) => {
  try {
    const { playerId, gameState } = await handler(props)
    const publicGameState = dehydratePublicGameState(getPublicGameState({
      gameState,
      playerId
    }))
    const serverTime = new Date().toISOString()
    res.status(200).json({ gameState: publicGameState, serverTime })
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

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})

// Stats API endpoints
app.get('/api/users/:uid/stats', apiLimiter, async (req, res) => {
  try {
    const stats = await getUserStats(req.params.uid as string)
    if (!stats) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({ error: genericErrorMessage })
  }
})

app.get('/api/users/:uid/displayName', apiLimiter, async (req, res) => {
  try {
    const displayName = await getDisplayName(req.params.uid as string)
    res.json({ displayName })
  } catch (error) {
    console.error('Error fetching display name:', error)
    res.status(500).json({ error: genericErrorMessage })
  }
})

app.put('/api/users/displayName', apiLimiter, json(), async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const token = authHeader.split('Bearer ')[1]
    const decoded = await verifyIdToken(token)
    if (!decoded) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const { displayName, photoURL } = req.body
    if (!displayName || typeof displayName !== 'string') {
      res.status(400).json({ error: 'displayNameRequired' })
      return
    }

    const trimmed = displayName.trim().slice(0, 10)
    if (trimmed.length === 0) {
      res.status(400).json({ error: 'displayNameRequired' })
      return
    }

    if (containsProfanity(trimmed)) {
      res.status(400).json({ error: 'inappropriateDisplayName' })
      return
    }

    const result = await setDisplayName(decoded.uid, trimmed, photoURL)
    if (result.error) {
      res.status(409).json({ error: result.error })
      return
    }
    res.json({ displayName: trimmed })
  } catch (error) {
    console.error('Error setting display name:', error)
    res.status(500).json({ error: genericErrorMessage })
  }
})

app.delete('/api/users/account', apiLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const token = authHeader.split('Bearer ')[1]
    const decoded = await verifyIdToken(token)
    if (!decoded) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    await deleteUserStats(decoded.uid)
    await adminAuth.deleteUser(decoded.uid)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting user account:', error)
    res.status(500).json({ error: genericErrorMessage })
  }
})

app.get('/api/leaderboard', apiLimiter, async (req, res) => {
  try {
    const minGames = Number.parseInt(req.query.minGames as string) || 5
    const limit = Math.min(Number.parseInt(req.query.limit as string) || 50, 100)
    const uid = req.query.uid as string | undefined
    const leaderboard = await getLeaderboard(minGames, limit, uid)
    res.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ error: genericErrorMessage })
  }
})

// Monetization endpoints
app.post('/api/payments/checkout', apiLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const token = authHeader.split('Bearer ')[1]
    const decoded = await verifyIdToken(token)
    if (!decoded) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const { productType, productId, donationAmountCents, successUrl, cancelUrl } = req.body

    if (!productType || !productId || !successUrl || !cancelUrl) {
      res.status(400).json({ error: 'Missing required parameters' })
      return
    }

    if (productType === 'donation' && productId === 'donation_custom') {
      const amount = Number(donationAmountCents)
      if (!Number.isInteger(amount) || amount < 100 || amount > 50000) {
        res.status(400).json({ error: 'Invalid custom donation amount' })
        return
      }
    }

    const user = await adminAuth.getUser(decoded.uid)
    const session = await createCheckoutSession({
      userId: decoded.uid,
      userEmail: user.email || '',
      productType,
      productId,
      donationAmountCents,
      successUrl,
      cancelUrl,
    })

    res.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: genericErrorMessage })
  }
})

app.post('/api/payments/webhook', async (req, res) => {
  try {
    const rawBody = (req as RequestWithRawBody).rawBody
    const signatureHeader = req.headers['stripe-signature']
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader
    if (!signature) {
      res.status(400).json({ error: 'Missing signature' })
      return
    }
    if (!rawBody) {
      res.status(400).json({ error: 'Missing raw webhook body' })
      return
    }

    const event = constructWebhookEvent(rawBody, signature)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      await handleCheckoutSessionCompleted(session)

      const { userId, productId, donationAmountCents } = session.metadata || {}
      if (userId && productId) {
        const premiumStatus = await grantPremiumAccess(
          userId,
          productId,
          donationAmountCents ? Number.parseInt(donationAmountCents, 10) : undefined,
        )
        await recordMonetizationHistory(
          userId,
          productId,
          session.amount_total ?? (donationAmountCents ? Number.parseInt(donationAmountCents, 10) : 0),
          session.currency || 'usd',
          premiumStatus.expiresAt,
          donationAmountCents ? Number.parseInt(donationAmountCents, 10) : undefined,
        )
      }
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(400).json({ error: 'webhook error' })
  }
})

app.get('/api/user/premium', apiLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const token = authHeader.split('Bearer ')[1]
    const decoded = await verifyIdToken(token)
    if (!decoded) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const premiumStatus = await getUserPremiumStatus(decoded.uid)
    res.json(premiumStatus)
  } catch (error) {
    console.error('Error fetching premium status:', error)
    res.status(500).json({ error: genericErrorMessage })
  }
})

app.get('/api/user/monetization-history', apiLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const token = authHeader.split('Bearer ')[1]
    const decoded = await verifyIdToken(token)
    if (!decoded) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const history = await getUserMonetizationHistory(decoded.uid)
    res.json(history)
  } catch (error) {
    console.error('Error fetching monetization history:', error)
    res.status(500).json({ error: genericErrorMessage })
  }
})

// Express error handling middleware
app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  void _next
  console.error('Unhandled Express error:', error)

  if (error instanceof GameMutationInputError) {
    const language = req.body?.language || req.query?.language || AvailableLanguageCode['en-US']
    const message = error.getMessage(language)
    res.status(error.httpCode || 400).json({ error: message })
  } else {
    res.status(500).json({ error: genericErrorMessage })
  }
})

server.listen(port, function () {
  console.log(`listening on ${port}`)
})
