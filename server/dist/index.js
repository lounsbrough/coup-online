import http from 'http';
import express from 'express';
import cors from 'cors';
import { getGameState } from './utilities/gameState';
const app = express();
app.use(cors());
const server = http.createServer(app);
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
    const gameState = await getGameState(roomId);
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