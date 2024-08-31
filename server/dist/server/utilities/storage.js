"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setValue = exports.getValue = void 0;
const redis_1 = require("redis");
const redisClientPromise = (0, redis_1.createClient)({ url: process.env.REDIS_CONNECTION_STRING })
    .on('error', (error) => console.log('Redis Client Error', error))
    .connect();
const getValue = async (key) => {
    return await (await redisClientPromise).get(key);
};
exports.getValue = getValue;
const setValue = async (key, value, lifeInSeconds) => {
    await (await redisClientPromise).set(key, value, {
        EX: lifeInSeconds
    });
};
exports.setValue = setValue;
//# sourceMappingURL=storage.js.map