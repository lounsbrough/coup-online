import { createClient } from "redis";

const redisClientPromise = createClient({ url: process.env.REDIS_CONNECTION_STRING })
  .on('error', (error: Error) => console.log('Redis Client Error', error))
  .connect();

export const getValue = async (key: string) => {
  return await (await redisClientPromise).get(key);
}

export const setValue = async (key: string, value: string, lifeInSeconds: number) => {
  await (await redisClientPromise).set(key, value, {
    EX: lifeInSeconds
  });
}
