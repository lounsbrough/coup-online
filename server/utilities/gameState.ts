import { createClient } from 'redis';
import { GameState } from '../types/game';

const redisClientPromise = createClient({ url: process.env.REDIS_CONNECTION_STRING })
  .on('error', (error: Error) => console.log('Redis Client Error', error))
  .connect();

const gameStates: {
  [roomId: string]: GameState
} = {};

export const getGameState = async (roomId: string) => {
  if (!gameStates[roomId]) {
    gameStates[roomId] = JSON.parse(await (await redisClientPromise).get(roomId));
  }
  return gameStates[roomId];
}

export const setGameState = async (roomId: string, newState: GameState) => {
  const fifteenMinutes = 900;
  await (await redisClientPromise).set(roomId, JSON.stringify(newState), {
    EX: fifteenMinutes
  });
  gameStates[roomId] = newState;
}
