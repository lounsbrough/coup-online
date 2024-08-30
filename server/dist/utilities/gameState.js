import { createClient } from 'redis';
const redisClientPromise = createClient({ url: process.env.REDIS_CONNECTION_STRING })
    .on('error', (error) => console.log('Redis Client Error', error))
    .connect();
const gameStates = {};
export const getGameState = async (roomId) => {
    if (!gameStates[roomId]) {
        gameStates[roomId] = JSON.parse(await (await redisClientPromise).get(roomId));
    }
    return gameStates[roomId];
};
export const setGameState = async (roomId, newState) => {
    await (await redisClientPromise).set(roomId, JSON.stringify(newState));
    gameStates[roomId] = newState;
};
//# sourceMappingURL=gameState.js.map