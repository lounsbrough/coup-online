"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const gameState_1 = require("./utilities/gameState");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const port = 8000;
app.get('/gameState', function (req, res) {
    res.json({});
});
app.post('/action', async (req, res) => {
    const roomId = req.body.roomId;
    const playerId = req.body.playerId;
    if (!roomId || !playerId) {
        res.status(400).send('room id and player id are required');
        return;
    }
    const gameState = await (0, gameState_1.getGameState)(roomId);
    if (!gameState) {
        res.status(400).send('invalid room id');
        return;
    }
    const player = gameState.players.find(({ id }) => id === playerId);
    if (!player) {
        res.status(400).send('player not in room');
        return;
    }
    // try to process action
    res.json({});
});
server.listen(process.env.PORT || port, function () {
    console.log(`listening on ${process.env.PORT || port}`);
});
//# sourceMappingURL=index.js.map