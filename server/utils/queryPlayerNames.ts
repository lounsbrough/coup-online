import { createClient } from "redis"
import { getGameState, mutateGameState } from "../src/utilities/gameState"
import { GameState } from "../../shared/types/game"

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

      // await mutateGameState(gameState, (state: GameState) => {
      //   state.chatMessages = []
      // })

      const players = gameState.players.map(({name, ai}) =>
        ({name: `${ai ? '🤖' : '🧍'} ${name}`}))
      console.log(players)
    }

    process.exit(0)
})()
