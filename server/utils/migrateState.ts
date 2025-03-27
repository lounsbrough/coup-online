import { createClient } from "redis"
import { getGameState, mutateGameState } from "../src/utilities/gameState"

(async () => {
  const redisClient = await createClient(
    process.env.REDIS_CONNECTION_STRING
      ? { url: process.env.REDIS_CONNECTION_STRING }
      : undefined
  )
    .on('error', (error: Error) => console.log('Redis Client Error', error))
    .connect()

    const roomIds = await redisClient.keys('*')

    for (const roomId of roomIds) {
      const gameState = await getGameState(roomId)

      await mutateGameState(gameState, (state) => {
        // modify state as needed for migration
      })

      const gameInfo = {
        lastEvent: gameState.lastEventTimestamp,
        chatMessages: gameState.chatMessages.length,
        players: gameState.players.map(({name, ai}) => ({name: `${ai ? '🤖' : '🧍'} ${name}`}))
      }
      console.log(gameInfo)
    }

    process.exit(0)
})()
