import { createClient } from 'redis';
import { GameState } from '../types/game';

const redisClient = await createClient(process.env.REDIS_CONNECTION_STRING)
  .on('error', (error: Error) => console.log('Redis Client Error', error))
  .connect();

const gameStates: {
  [roomId: string]: GameState
} = {};

export const getGameState = async (roomId: string) => {
  if (!gameStates[roomId]) {
    gameStates[roomId] = await redisClient.get(roomId);
  }
  return gameStates[roomId];
}

export const setGameState = async (roomId: string, newState: GameState) => {
  await redisClient.set(roomId, newState);
  gameStates[roomId] = newState;
}
