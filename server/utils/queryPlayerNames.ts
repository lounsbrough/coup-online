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
      // await mutateGameState(origState, (state: GameState) => {
      //   state.players.forEach((player) => {
      //     if (!player.unclaimedInfluences) player.unclaimedInfluences = []
      //   })
      //   return state
      // })

      const players = (await getGameState(roomId)).players.map(({name, ai}) =>
        ({name: `${ai ? '🤖' : '🧍'} ${name}`}))
      console.log(players)
    }

    process.exit(0)
})()
