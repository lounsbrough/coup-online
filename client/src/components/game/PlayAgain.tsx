import { useState } from "react";
import { Button, Typography } from "@mui/material";
import useSWRMutation from "swr/mutation";
import { getPlayerId } from "../../helpers/playerId";

function PlayAgain({ roomId }: { roomId: string }) {
  const [error, setError] = useState<string>();

  const { trigger, isMutating, error: swrError } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8000'}/resetGame`, (async (url: string, { arg }: { arg: { roomId: string, playerId: string }; }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (!res.ok) {
        setError('Error starting new game');
      }
    })
  }))

  return (
    <>
      <Button
        onClick={() => {
          trigger({ roomId, playerId: getPlayerId() })
        }}
        variant="contained"
      >Play Again</Button>
      {error && <Typography sx={{ mt: 3, fontWeight: 700, color: 'red' }}>{error}</Typography>}
    </>
  );
}

export default PlayAgain;
