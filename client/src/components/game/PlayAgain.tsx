import { useState } from "react";
import { Button, Typography } from "@mui/material";
import useSWRMutation from "swr/mutation";
import { getPlayerId } from "../../helpers/playerId";
import { useGameStateContext } from "../../context/GameStateContext";

function PlayAgain() {
  const [error, setError] = useState<string>();
  const { gameState, setGameState } = useGameStateContext();

  const { trigger, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8000'}/resetGame`, (async (url: string, { arg }: { arg: { roomId: string, playerId: string }; }) => {
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
  }))

  if (!gameState) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => {
          trigger({
            roomId: gameState.roomId,
            playerId: getPlayerId()
          })
        }}
        variant="contained"
        disabled={isMutating}
      >Play Again</Button>
      {error && <Typography sx={{ mt: 3, fontWeight: 700, color: 'red' }}>{error}</Typography>}
    </>
  );
}

export default PlayAgain;
