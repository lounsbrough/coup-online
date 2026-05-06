import { Application, NextFunction, Request, Response } from 'express'
import Joi, { ObjectSchema } from 'joi'
import { Server as SocketServer, Socket } from 'socket.io'
import {
  Actions,
  Influences,
  Responses,
  DehydratedPublicGameState,
  PlayerActions,
  ServerEvents,
  AiPersonality,
  GameSettings,
  GameState,
} from '../../../shared/types/game'
import { AvailableLanguageCode } from '../../../shared/i18n/availableLanguages'
import { dehydratePublicGameState } from '../../../shared/helpers/state'
import {
  actionChallengeResponseHandler,
  actionHandler,
  actionResponseHandler,
  addAiPlayerHandler,
  blockChallengeResponseHandler,
  blockResponseHandler,
  checkAutoMoveHandler,
  createGameHandler,
  forfeitGameHandler,
  getGameStateHandler,
  joinGameHandler,
  loseInfluencesHandler,
  removeFromGameHandler,
  resetGameHandler,
  resetGameRequestCancelHandler,
  resetGameRequestHandler,
  sendChatMessageHandler,
  setChatMessageDeletedHandler,
  setEmojiOnChatMessageHandler,
  startGameHandler,
} from '../game/actionHandlers'
import { translate } from '../i18n/translations'
import { GameMutationInputError, WrongPlayerIdOnSocketError } from '../utilities/errors'
import { getPublicGameState } from '../utilities/gameState'
import { getObjectEntries } from '../utilities/object'
import { containsProfanity } from '../utilities/profanity'

export type DehydratedPublicGameStateOrError =
  | { gameState: DehydratedPublicGameState, serverTime: string, error?: never }
  | { error: string, gameState?: never, serverTime?: never }

export type ServerToClientEvents = {
  [ServerEvents.gameStateChanged]: (payload: { gameState: DehydratedPublicGameState, serverTime: string }) => void
  [ServerEvents.error]: (error: string) => void
}

export type ClientToServerEvents = {
  [action in PlayerActions]: (
    params: { language: AvailableLanguageCode } & Record<string, unknown>,
    callback?: (response: DehydratedPublicGameStateOrError) => void
  ) => Promise<void>
}

export type InterServerEvents = object
export type SocketData = { playerId: string }

type SocketIo = SocketServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

export const registerGameControllers = ({
  app,
  io,
  genericErrorMessage,
}: {
  app: Application
  io: SocketIo
  genericErrorMessage: string
}) => {
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
          error: translate({
            key: 'invalidUserRequest',
            language: (req[requestProperty] as { language?: AvailableLanguageCode }).language ?? AvailableLanguageCode['en-US'],
          }),
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
        parseParams: (req) => ({
          roomId: req.query.roomId as string,
          playerId: req.query.playerId as string,
          language: req.query.language as AvailableLanguageCode,
        }),
        validator: validateExpressQuery,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        language: languageRule,
      }),
    },
    [PlayerActions.createGame]: {
      handler: createGameHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          playerId: req.body.playerId as string,
          playerName: req.body.playerName as string,
          settings: req.body.settings as GameSettings,
          language: req.body.language as AvailableLanguageCode,
          uid: req.body.uid as string | undefined,
          photoURL: req.body.photoURL as string | undefined,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        playerId: Joi.string().required(),
        playerName: playerNameRule,
        settings: Joi.object().keys({
          eventLogRetentionTurns: Joi.number().integer().min(1).max(100).required(),
          allowRevive: Joi.bool().required(),
          aiMoveDelayMs: Joi.number().integer().min(0).max(10000),
          speedRoundSeconds: Joi.number().integer().min(5).max(60),
        }).required(),
        language: languageRule,
        uid: Joi.string().optional(),
        photoURL: Joi.string().uri().optional(),
      }),
    },
    [PlayerActions.joinGame]: {
      handler: joinGameHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          playerName: (req.body.playerName as string).trim(),
          language: req.body.language as AvailableLanguageCode,
          uid: req.body.uid as string | undefined,
          photoURL: req.body.photoURL as string | undefined,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        playerName: playerNameRule,
        language: languageRule,
        uid: Joi.string().optional(),
        photoURL: Joi.string().uri().optional(),
      }),
    },
    [PlayerActions.addAiPlayer]: {
      handler: addAiPlayerHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          playerName: (req.body.playerName as string).trim(),
          personality: req.body.personality as AiPersonality | undefined,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        playerName: playerNameRule,
        personality: Joi.object().keys({
          vengefulness: Joi.number().integer().min(0).max(100).required(),
          honesty: Joi.number().integer().min(0).max(100).required(),
          skepticism: Joi.number().integer().min(0).max(100).required(),
        }),
        language: languageRule,
      }),
    },
    [PlayerActions.removeFromGame]: {
      handler: removeFromGameHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          playerName: (req.body.playerName as string).trim(),
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        playerName: playerNameRule,
        language: languageRule,
      }),
    },
    [PlayerActions.startGame]: {
      handler: startGameHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        language: languageRule,
      }),
    },
    [PlayerActions.resetGameRequest]: {
      handler: resetGameRequestHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        language: languageRule,
      }),
    },
    [PlayerActions.resetGameRequestCancel]: {
      handler: resetGameRequestCancelHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        language: languageRule,
      }),
    },
    [PlayerActions.resetGame]: {
      handler: resetGameHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        language: languageRule,
      }),
    },
    [PlayerActions.forfeit]: {
      handler: forfeitGameHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          replaceWithAi: req.body.replaceWithAi as boolean,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        replaceWithAi: Joi.bool().required(),
        language: languageRule,
      }),
    },
    [PlayerActions.checkAutoMove]: {
      handler: checkAutoMoveHandler,
      express: {
        method: 'get',
        parseParams: (req) => ({
          roomId: req.query.roomId as string,
          playerId: req.query.playerId as string,
          language: req.query.language as AvailableLanguageCode,
        }),
        validator: validateExpressQuery,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        language: languageRule,
      }),
    },
    [PlayerActions.action]: {
      handler: actionHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          action: req.body.action as Actions,
          targetPlayer: req.body.targetPlayer as string | undefined,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        action: Joi.string().allow(...Object.values(Actions)).required(),
        targetPlayer: Joi.string(),
        language: languageRule,
      }),
    },
    [PlayerActions.actionResponse]: {
      handler: actionResponseHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          response: req.body.response as Responses,
          claimedInfluence: req.body.claimedInfluence as Influences | undefined,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        response: Joi.string().allow(...Object.values(Responses)).required(),
        claimedInfluence: Joi.string().allow(...Object.values(Influences)),
        language: languageRule,
      }),
    },
    [PlayerActions.actionChallengeResponse]: {
      handler: actionChallengeResponseHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          influence: req.body.influence as Influences,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        influence: Joi.string().allow(...Object.values(Influences)).required(),
        language: languageRule,
      }),
    },
    [PlayerActions.blockResponse]: {
      handler: blockResponseHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          response: req.body.response as Responses,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        response: Joi.string().allow(...Object.values(Responses)).required(),
        language: languageRule,
      }),
    },
    [PlayerActions.blockChallengeResponse]: {
      handler: blockChallengeResponseHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          influence: req.body.influence as Influences,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        influence: Joi.string().allow(...Object.values(Influences)).required(),
        language: languageRule,
      }),
    },
    [PlayerActions.loseInfluences]: {
      handler: loseInfluencesHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          influences: req.body.influences as Influences[],
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        influences: Joi.array().items(
          Joi.string().allow(...Object.values(Influences)).required(),
        ).min(1).max(2).required(),
        language: languageRule,
      }),
    },
    [PlayerActions.sendChatMessage]: {
      handler: sendChatMessageHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          messageId: req.body.messageId as string,
          messageText: (req.body.messageText as string).trim(),
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        messageId: Joi.string().guid().required(),
        messageText: Joi.string().required().max(500),
        language: languageRule,
      }),
    },
    [PlayerActions.setChatMessageDeleted]: {
      handler: setChatMessageDeletedHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          messageId: req.body.messageId as string,
          deleted: req.body.deleted as boolean,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        messageId: Joi.string().guid().required(),
        deleted: Joi.bool().required(),
        language: languageRule,
      }),
    },
    [PlayerActions.setEmojiOnChatMessage]: {
      handler: setEmojiOnChatMessageHandler,
      express: {
        method: 'post',
        parseParams: (req) => ({
          roomId: req.body.roomId as string,
          playerId: req.body.playerId as string,
          messageId: req.body.messageId as string,
          emoji: req.body.emoji as string,
          selected: req.body.selected as boolean,
          language: req.body.language as AvailableLanguageCode,
        }),
        validator: validateExpressBody,
      },
      joiSchema: Joi.object().keys({
        roomId: Joi.string().required(),
        playerId: Joi.string().required(),
        messageId: Joi.string().guid().required(),
        emoji: Joi.string().required().max(20),
        selected: Joi.bool().required(),
        language: languageRule,
      }),
    },
  }

  io.on('connection', (socket) => {
    getObjectEntries(eventHandlers).forEach(([event, { handler, joiSchema }]) => {
      socket.on(event, async (params, callback) => {
        const result = joiSchema.validate(params, { abortEarly: false })

        if (result.error) {
          const error = translate({ key: 'invalidUserRequest', language: params.language ?? AvailableLanguageCode['en-US'] })
          socket.emit(ServerEvents.error, error)
          callback?.({ error })
          return
        }

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
              const publicGameState = dehydratePublicGameState(
                getPublicGameState({ gameState: fullGameState, playerId: pushToSocket.data.playerId }),
              )
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
              const roomSockets = [...roomSocketIds]
                .map((socketId) => io.sockets.sockets.get(socketId))
                .filter((roomSocket): roomSocket is Socket => roomSocket !== undefined)
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
      })
    })
  })

  const responseHandler = <T>(
    event: PlayerActions,
    handler: (props: T) => Promise<{ roomId: string, playerId: string, gameState: GameState }>,
  ) => async (
    res: Response<DehydratedPublicGameStateOrError>,
    props: { language: AvailableLanguageCode } & T,
  ) => {
    try {
      const { playerId, gameState } = await handler(props)
      const publicGameState = dehydratePublicGameState(getPublicGameState({ gameState, playerId }))
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
}
