import { createClient, RESP_TYPES } from "redis"

const createRedisClient = () =>
  createClient(
    process.env.REDIS_CONNECTION_STRING
      ? { url: process.env.REDIS_CONNECTION_STRING }
      : undefined
  )
    .on('error', (error: Error) => console.log('Redis Client Error', error))
    .connect()
    .then((client) => client.withTypeMapping({
      [RESP_TYPES.BLOB_STRING]: Buffer
    }))

let redisClientPromise: ReturnType<typeof createRedisClient> | undefined
const getRedisClientPromise = () => {
  redisClientPromise ??= createRedisClient()
  return redisClientPromise
}

export const getValue = async (key: string): Promise<Buffer | null> => {
  return (await getRedisClientPromise()).get(key)
}

export const setValue = async (key: string, value: Buffer, lifeInSeconds: number) => {
  await (await getRedisClientPromise()).set(key, value, {
    EX: lifeInSeconds
  })
}
