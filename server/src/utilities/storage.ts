import { createClient, RedisClientType } from "redis"

const createRedisClient = () =>
  createClient({ url: process.env.REDIS_CONNECTION_STRING })
    .on('error', (error: Error) => console.log('Redis Client Error', error))
    .connect()

let redisClientPromise: Promise<RedisClientType> | undefined
const getRedisClientPromise = () => {
  if (!redisClientPromise) {
    redisClientPromise = createRedisClient() as Promise<RedisClientType>
  }
  return redisClientPromise
}

export const getValue = async (key: string) => {
  return (await getRedisClientPromise()).get(key)
}

export const setValue = async (key: string, value: string, lifeInSeconds: number) => {
  await (await getRedisClientPromise()).set(key, value, {
    EX: lifeInSeconds
  })
}
