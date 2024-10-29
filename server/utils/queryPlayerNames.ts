import { createClient } from "redis"
import { getGameState } from "../src/utilities/gameState"

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
      const playerNames = (await getGameState(roomId)).players.map(({name}) => name)
      console.log(playerNames)
    }

    process.exit(0)
})()
