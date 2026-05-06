import http from 'node:http'
import express, { NextFunction, Request, Response } from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { Server as ioServer } from 'socket.io'
import { AvailableLanguageCode } from '../shared/i18n/availableLanguages'
import { GameMutationInputError } from './src/utilities/errors'
import {
  registerGameControllers,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  DehydratedPublicGameStateOrError,
} from './src/controllers/gameController'
import { registerUserControllers } from './src/controllers/userController'
import { registerMonetizationControllers } from './src/controllers/monetizationController'

export type { DehydratedPublicGameStateOrError }

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
  cors: { origin: '*' },
})

registerGameControllers({ app, io, genericErrorMessage })

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})

registerUserControllers({ app, apiLimiter, genericErrorMessage })
registerMonetizationControllers({ app, apiLimiter, genericErrorMessage })

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  void _next
  console.error('Unhandled Express error:', error)

  if (error instanceof GameMutationInputError) {
    const language = req.body?.language || req.query?.language || AvailableLanguageCode['en-US']
    const message = error.getMessage(language)
    res.status(error.httpCode || 400).json({ error: message })
    return
  }

  res.status(500).json({ error: genericErrorMessage })
})

server.listen(port, () => {
  console.log(`listening on ${port}`)
})
