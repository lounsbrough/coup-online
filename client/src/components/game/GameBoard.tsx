import { Button, Grid2, Typography } from "@mui/material";
import PlayerInfluences from "../game/PlayerInfluences";
import Players from "../game/Players";
import EventLog from "./EventLog";
import PlayerDecision from "./PlayerDecision";
import SnarkyDeadComment from "./SnarkyDeadComment";
import { PublicGameState } from "../../shared/types/game";
import Victory from "./Victory";
import PlayAgain from "./PlayAgain";

function GameBoard({ roomId, gameState }: { roomId: string, gameState: PublicGameState }) {
  const turnPlayer = gameState.players.find((player) =>
    player.name === gameState.turnPlayer
  );
  const playersLeft = gameState.players.filter(({ influenceCount }) => influenceCount);
  const gameIsOver = playersLeft.length === 1;

  return (
    <>
      <Grid2 container sx={{ p: 2 }} justifyContent="space-between">
        {turnPlayer && (
          <Grid2>
            {!gameIsOver && (
              <>
                <Typography component="span" sx={{ fontSize: '20px' }}>Turn: </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 'bold',
                    color: turnPlayer.color,
                    fontSize: '24px'
                  }}
                >{gameState.turnPlayer}</Typography>
              </>
            )}
          </Grid2>
        )}
        <Grid2>
          <EventLog gameState={gameState} />
        </Grid2>
      </Grid2>
      {gameIsOver && (
        <Grid2 sx={{ mb: 5 }}>
          <Victory player={playersLeft[0]} />
        </Grid2>
      )}
      {gameIsOver && (
        <Grid2 sx={{ m: 5 }}>
          <PlayAgain roomId={roomId} />
        </Grid2>
      )}
      {!gameState.selfPlayer.influences.length && (
        <Grid2>
          <SnarkyDeadComment />
        </Grid2>
      )}
      <Grid2 container justifyContent="center">
        <Grid2>
          <PlayerInfluences player={gameState.selfPlayer} />
        </Grid2>
      </Grid2>
      <Grid2 container justifyContent="center">
        <Grid2 sx={{ p: 2 }}>
          <Players gameState={gameState} />
        </Grid2>
      </Grid2>
      {!gameIsOver && (
        <Grid2 container justifyContent="center">
          <Grid2 sx={{ p: 2 }}>
            <PlayerDecision roomId={roomId} gameState={gameState} />
          </Grid2>
        </Grid2>
      )}
    </>
  )
}

export default GameBoard;
