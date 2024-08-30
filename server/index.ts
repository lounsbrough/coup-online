import http from 'http';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);

const port = 8000;

app.get('/publicGameState', function (req, res) {
    res.json({});
});

server.listen(process.env.PORT || port, function () {
    console.log(`listening on ${process.env.PORT || port}`);
});
