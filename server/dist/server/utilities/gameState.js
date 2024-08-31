"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGameState = exports.getGameState = void 0;
const storage_1 = require("./storage");
const gameStates = {};
const getGameState = async (roomId) => {
    if (!gameStates[roomId]) {
        gameStates[roomId] = JSON.parse(await (0, storage_1.getValue)(roomId));
    }
    return gameStates[roomId];
};
exports.getGameState = getGameState;
const setGameState = async (roomId, newState) => {
    const fifteenMinutes = 900;
    await (0, storage_1.setValue)(roomId, JSON.stringify(newState), fifteenMinutes);
    gameStates[roomId] = newState;
};
exports.setGameState = setGameState;
//# sourceMappingURL=gameState.js.map