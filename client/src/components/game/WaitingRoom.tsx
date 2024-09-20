import { Button, Grid2, Typography } from "@mui/material";
import Players from "../game/Players";
import useSWRMutation from "swr/mutation";
import { ContentCopy } from "@mui/icons-material";
import { getPlayerId } from "../../helpers/playerId";
import { useGameStateContext } from "../../contexts/GameStateContext";
import { useState } from "react";

function WaitingRoom() {
  const [error, setError] = useState<string>();
  const { gameState, setGameState } = useGameStateContext();

  const { trigger, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/startGame`, (async (url: string, { arg }: { arg: { roomId: string, playerId: string }; }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (res.ok) {
        setGameState(await res.json());
      } else {
        setError('Error starting new game');
      }
    })
  }));

  if (!gameState) {
    return null;
  }

  return (
    <>
      <Grid2 container justifyContent="center">
        <Grid2 sx={{ p: 2 }}>
          <Players />
        </Grid2>
      </Grid2>
      <Grid2 container direction='column' spacing={2}>
        <Grid2>
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/join-game?roomId=${gameState.roomId}`)
            }}
          >
            Copy Invite Link
          </Button>
        </Grid2>
        {gameState.players.length <= 1 && (
          <Grid2>
            <Typography>Add at least one more player to start game</Typography>
          </Grid2>
        )}
        {gameState.players.length > 1 && (
          <Grid2>
            <Button
              variant='contained'
              onClick={() => {
                trigger({
                  roomId: gameState.roomId,
                  playerId: getPlayerId()
                })
              }}
              disabled={isMutating}
            >
              Start Game
            </Button>
            {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
          </Grid2>
        )}
      </Grid2>
    </>
  )
}

export default WaitingRoom;
