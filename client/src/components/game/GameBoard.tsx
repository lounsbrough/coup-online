import { Box, Grid2, Typography } from "@mui/material";
import PlayerInfluences from "../game/PlayerInfluences";
import Players from "../game/Players";
import EventLog from "./EventLog";
import PlayerDecision from "./PlayerDecision";
import SnarkyDeadComment from "./SnarkyDeadComment";
import Victory from "./Victory";
import PlayAgain from "./PlayAgain";
import { useGameStateContext } from "../../context/GameStateContext";

function GameBoard() {
  const { gameState } = useGameStateContext();

  if (!gameState) {
    return null;
  }

  const turnPlayer = gameState.players.find((player) =>
    player.name === gameState.turnPlayer
  );
  const playersLeft = gameState.players.filter(({ influenceCount }) => influenceCount);
  const gameIsOver = playersLeft.length === 1;

  return (
    <Grid2 container>
      <Grid2 size={{ xs: 12, sm: 12, md: 2 }} />
      <Grid2 p={2} size={{ xs: 12, sm: 12, md: 8 }}>
        {gameIsOver && (
          <Grid2 sx={{ mb: 5 }}>
            <Victory player={playersLeft[0]} />
          </Grid2>
        )}
        {gameIsOver && (
          <Grid2 sx={{ m: 5 }}>
            <PlayAgain />
          </Grid2>
        )}
        {!gameState.selfPlayer.influences.length && (
          <Grid2>
            <SnarkyDeadComment />
          </Grid2>
        )}
        {turnPlayer && !gameIsOver && (
          <Box mb={2}>
            <Typography
              component="span"
              sx={{ fontWeight: 'bold', color: turnPlayer.color, fontSize: '24px' }}
            >{gameState.turnPlayer}</Typography>
            <Typography component="span" sx={{ fontSize: '24px' }}>'s Turn</Typography>
          </Box>
        )}
        {!!gameState?.selfPlayer?.influences?.length && (
          <Grid2 container justifyContent="center">
            <Box sx={{ background: 'rgba(120, 120, 120, 0.25)', p: 2, borderRadius: 3 }}>
              <Typography mb={1} fontSize='24px'>Your Influences</Typography>
              <PlayerInfluences />
            </Box>
          </Grid2>
        )}
        <Grid2 container justifyContent="center" sx={{ my: 2 }}>
          <Box sx={{ background: 'rgba(120, 120, 120, 0.25)', p: 2, borderRadius: 3 }}>
            <Typography mb={1} fontSize='24px'>Players</Typography>
            <Players />
          </Box>
        </Grid2>
        {!gameIsOver && (
          <Grid2 container justifyContent="center">
            <Grid2 sx={{ p: 2 }}>
              <PlayerDecision />
            </Grid2>
          </Grid2>
        )}
      </Grid2>
      <Grid2 sx={{ textAlign: 'left', px: 2 }} size={{ xs: 12, sm: 12, md: 2 }}>
        <EventLog />
      </Grid2>
    </Grid2>
  )
}

export default GameBoard;
