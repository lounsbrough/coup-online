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
      // await mutateGameState(origState, (state: GameState) => {
      //   state.players.forEach((player) => {
      //     if (!player.unclaimedInfluences) player.unclaimedInfluences = []
      //   })
      //   return state
      // })

      const playerNames = (await getGameState(roomId)).players.map(({name}) => name)
      console.log(playerNames)
    }

    process.exit(0)
})()
