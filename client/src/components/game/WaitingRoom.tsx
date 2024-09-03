import { Button, Grid2, Typography } from "@mui/material";
import { PublicGameState } from "../../../../shared/types/game";
import Players from "../game/Players";
import useSWRMutation from "swr/mutation";
import { ContentCopy } from "@mui/icons-material";

function WaitingRoom({ roomId, gameState }: {
  roomId: string,
  gameState: PublicGameState
}) {
  const { trigger } = useSWRMutation(`${process.env.REACT_API_BASE_URL ?? 'http://localhost:8000'}/startGame`, (async (url: string, { arg }: { arg: { roomId: string }; }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    })
  }))

  return (
    <>
      <Grid2 container justifyContent="center">
        <Grid2 sx={{ p: 2 }}>
          <Players players={gameState.players} />
        </Grid2>
      </Grid2>
      <Grid2 container direction='column' spacing={2}>
        <Grid2>
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/join-game?roomId=${roomId}`)
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
                trigger({ roomId })
              }}
            >
              Start Game
            </Button>
          </Grid2>
        )}
      </Grid2>
    </>
  )
}

export default WaitingRoom;
