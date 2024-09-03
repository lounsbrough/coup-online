import { Grid2, Typography } from "@mui/material";
import PlayerInfluences from "../game/PlayerInfluences";
import { PublicGameState } from "../../../../shared/types/game";
import Players from "../game/Players";
import EventLog from "./EventLog";
import ChooseAction from "./ChooseAction";
import ChooseActionResponse from "./ChooseActionResponse";

function GameBoard({ roomId, gameState }: { roomId: string, gameState: PublicGameState }) {
  const turnPlayer = gameState.players.find((player) =>
    player.name === gameState.turnPlayer
  );

  return (
    <>
      <Grid2 container sx={{ p: 2 }} justifyContent="space-between">
        {turnPlayer && (
          <Grid2>
            <Typography component="span" sx={{ fontSize: '20px' }}>Turn: </Typography>
            <Typography
              component="span"
              sx={{
                fontWeight: 'bold',
                color: turnPlayer.color,
                fontSize: '24px'
              }}
            >{gameState.turnPlayer}</Typography>
          </Grid2>
        )}
        <Grid2>
          <EventLog gameState={gameState} />
        </Grid2>
      </Grid2>
      <Grid2 container justifyContent="center">
        <Grid2 sx={{ background: 'lightGray', p: 2, borderRadius: 3 }}>
          <PlayerInfluences player={gameState.selfPlayer} />
        </Grid2>
      </Grid2>
      <Grid2 container justifyContent="center">
        <Grid2 sx={{ p: 2 }}>
          <Players gameState={gameState} />
        </Grid2>
      </Grid2>
      {turnPlayer?.name === gameState.selfPlayer.name &&
        !gameState.pendingAction &&
        !gameState.pendingActionChallenge &&
        !gameState.pendingBlock &&
        !gameState.pendingBlockChallenge && (
          <Grid2 container justifyContent="center">
            <Grid2>
              <ChooseAction roomId={roomId} gameState={gameState} />
            </Grid2>
          </Grid2>
        )}
      {turnPlayer?.name !== gameState.selfPlayer.name &&
        gameState.pendingAction &&
        gameState.pendingAction.pendingPlayers.includes(gameState.selfPlayer.name) && (
          <Grid2 container justifyContent="center">
            <Grid2>
              <ChooseActionResponse roomId={roomId} gameState={gameState} />
            </Grid2>
          </Grid2>
        )}
    </>
  )
}

export default GameBoard;
