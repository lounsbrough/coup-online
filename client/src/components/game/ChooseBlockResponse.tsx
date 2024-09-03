import { Button, Grid2, Typography } from "@mui/material";
import { ActionAttributes, Actions, InfluenceAttributes, Influences, PublicGameState, ResponseAttributes, Responses } from "../../shared/types/game";
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { getPlayerId } from "../../helpers/playerId";

function ChooseBlockResponse({ roomId, gameState }: { roomId: string, gameState: PublicGameState }) {
  const [error, setError] = useState<string>();

  const { trigger, isMutating, error: swrError } = useSWRMutation(`${process.env.REACT_API_BASE_URL ?? 'http://localhost:8000'}/blockResponse`, (async (url: string, { arg }: { arg: { roomId: string, playerId: string; response: Responses }; }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (!res.ok) {
        setError('Error responding to block');
      }
    })
  }))

  return (
    <>
      <Typography sx={{ my: 1, fontWeight: 'bold', fontSize: '24px' }}>
        Choose a Response:
      </Typography>
      <Grid2 container spacing={2} justifyContent="center">
        {Object.entries(ResponseAttributes).map(([response, responseAttributes], index) => {
          if (response === Responses.Block) {
            return null;
          }

          return <Button
            key={index}
            onClick={() => {
              trigger({
                roomId,
                playerId: getPlayerId(),
                response: response as Responses
              })
            }}
            sx={{
              background: responseAttributes.color
            }} variant="contained"
          >
            {response}
          </Button>
        })}
      </Grid2>
      {error && <Typography sx={{ mt: 3, fontWeight: 700, color: 'red' }}>{error}</Typography>}
    </>
  );
}

export default ChooseBlockResponse;
