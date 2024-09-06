"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextPlayerTurn = exports.addPlayerToGame = exports.resetGame = exports.startGame = exports.createNewGame = exports.logEvent = exports.drawCardFromDeck = exports.processPendingAction = exports.shuffle = exports.killPlayerInfluence = exports.mutateGameState = exports.getPublicGameState = exports.getGameState = void 0;
const game_1 = require("../../shared/types/game");
const storage_1 = require("./storage");
const getGameState = async (roomId) => {
    const state = JSON.parse(await (0, storage_1.getValue)(roomId));
    return state ? { ...state } : null;
};
exports.getGameState = getGameState;
const getPublicGameState = async (roomId, playerId) => {
    const gameState = await (0, exports.getGameState)(roomId);
    if (gameState === null) {
        return null;
    }
    let selfPlayer;
    const publicPlayers = [];
    gameState.players.forEach((player) => {
        publicPlayers.push({
            name: player.name,
            coins: player.coins,
            influenceCount: player.influences.length,
            color: player.color
        });
        if (player.id === playerId) {
            selfPlayer = player;
        }
    });
    return {
        roomId: gameState.roomId,
        turnPlayer: gameState.turnPlayer,
        isStarted: gameState.isStarted,
        pendingAction: gameState.pendingAction,
        pendingActionChallenge: gameState.pendingActionChallenge,
        pendingBlock: gameState.pendingBlock,
        pendingBlockChallenge: gameState.pendingBlockChallenge,
        pendingInfluenceLoss: gameState.pendingInfluenceLoss,
        eventLogs: gameState.eventLogs,
        players: publicPlayers,
        selfPlayer
    };
};
exports.getPublicGameState = getPublicGameState;
const setGameState = async (roomId, newState) => {
    const fifteenMinutes = 900;
    await (0, storage_1.setValue)(roomId, JSON.stringify(newState), fifteenMinutes);
};
const validateGameState = (state) => {
    if (state.players.length < 1 || state.players.length > 6) {
        throw new Error("Game state must always have 1 to 6 players");
    }
};
const mutateGameState = async (roomId, mutation) => {
    const gameState = await (0, exports.getGameState)(roomId);
    mutation(gameState);
    validateGameState(gameState);
    await setGameState(roomId, gameState);
};
exports.mutateGameState = mutateGameState;
const killPlayerInfluence = (state, playerName, putBackInDeck = false) => {
    state.pendingInfluenceLoss[playerName] = [
        ...(state.pendingInfluenceLoss[playerName] ?? []),
        { putBackInDeck }
    ];
};
exports.killPlayerInfluence = killPlayerInfluence;
const shuffle = (array) => {
    const unShuffled = [...array];
    const shuffled = [];
    while (unShuffled.length) {
        shuffled.push(unShuffled.splice(Math.floor(Math.random() * unShuffled.length), 1)[0]);
    }
    return shuffled;
};
exports.shuffle = shuffle;
const processPendingAction = async (state) => {
    const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer);
    const targetPlayer = state.players.find(({ name }) => name === state.pendingAction.targetPlayer);
    if (state.pendingAction.action === game_1.Actions.Assassinate) {
        actionPlayer.coins -= game_1.ActionAttributes.Assassinate.coinsRequired;
        (0, exports.killPlayerInfluence)(state, targetPlayer.name);
    }
    else if (state.pendingAction.action === game_1.Actions.Exchange) {
        actionPlayer.influences.push((0, exports.drawCardFromDeck)(state), (0, exports.drawCardFromDeck)(state));
        state.deck = (0, exports.shuffle)(state.deck);
        (0, exports.killPlayerInfluence)(state, actionPlayer.name, true);
        (0, exports.killPlayerInfluence)(state, actionPlayer.name, true);
    }
    else if (state.pendingAction.action === game_1.Actions.ForeignAid) {
        actionPlayer.coins += 2;
    }
    else if (state.pendingAction.action === game_1.Actions.Steal) {
        const coinsAvailable = Math.min(2, targetPlayer.coins);
        actionPlayer.coins += coinsAvailable;
        targetPlayer.coins -= coinsAvailable;
    }
    else if (state.pendingAction.action === game_1.Actions.Tax) {
        actionPlayer.coins += 3;
    }
    if (!Object.keys(state.pendingInfluenceLoss).length) {
        state.turnPlayer = (0, exports.getNextPlayerTurn)(state);
    }
    (0, exports.logEvent)(state, `${actionPlayer.name} used ${state.pendingAction.action}${targetPlayer ? ` on ${targetPlayer.name}` : ''}`);
    delete state.pendingAction;
};
exports.processPendingAction = processPendingAction;
const buildShuffledDeck = () => {
    return (0, exports.shuffle)(Object.values(game_1.Influences)
        .flatMap((influence) => Array.from({ length: 3 }, () => influence)));
};
const drawCardFromDeck = (state) => {
    return state.deck.pop();
};
exports.drawCardFromDeck = drawCardFromDeck;
const logEvent = (state, log) => {
    state.eventLogs.push(log);
    if (state.eventLogs.length > 100) {
        state.eventLogs.splice(0, 1);
    }
};
exports.logEvent = logEvent;
const createNewGame = async (roomId) => {
    await setGameState(roomId, {
        roomId,
        players: [],
        deck: buildShuffledDeck(),
        pendingInfluenceLoss: {},
        isStarted: false,
        eventLogs: []
    });
};
exports.createNewGame = createNewGame;
const startGame = async (roomId) => {
    await (0, exports.mutateGameState)(roomId, (state) => {
        state.isStarted = true;
        state.turnPlayer = state.players[Math.floor(Math.random() * state.players.length)].name;
        (0, exports.logEvent)(state, 'Game has started');
    });
};
exports.startGame = startGame;
const resetGame = async (roomId) => {
    const oldGameState = await (0, exports.getGameState)(roomId);
    await (0, exports.createNewGame)(roomId);
    await (0, exports.mutateGameState)(roomId, (state) => {
        const newPlayers = (0, exports.shuffle)(oldGameState.players.map((player) => ({
            ...player,
            coins: 2,
            influences: Array.from({ length: 2 }, () => (0, exports.drawCardFromDeck)(state))
        })));
        state.players = newPlayers;
    });
};
exports.resetGame = resetGame;
const addPlayerToGame = async (roomId, playerId, playerName) => {
    await (0, exports.mutateGameState)(roomId, (state) => {
        state.players.push({
            id: playerId,
            name: playerName,
            coins: 2,
            influences: Array.from({ length: 2 }, () => (0, exports.drawCardFromDeck)(state)),
            color: ['#23C373', '#0078ff', '#fD6C33', '#ff7799', '#FFC303', '#fA0088'][state.players.length]
        });
        return state;
    });
};
exports.addPlayerToGame = addPlayerToGame;
const getNextPlayerTurn = (state) => {
    const currentIndex = state.players.findIndex((player) => player.name === state.turnPlayer);
    let nextIndex = currentIndex + 1;
    while (!state.players[nextIndex % state.players.length].influences.length) {
        if (nextIndex % state.players.length === currentIndex) {
            throw new Error('Unable to determine next player turn');
        }
        nextIndex++;
    }
    return state.players[nextIndex % state.players.length].name;
};
exports.getNextPlayerTurn = getNextPlayerTurn;
//# sourceMappingURL=gameState.js.map