import { Button, Grid2, Typography } from "@mui/material";
import { ResponseAttributes, Responses } from "../../shared/types/game";
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { getPlayerId } from "../../helpers/playerId";
import { useGameStateContext } from "../../context/GameStateContext";
import { useColorModeContext } from "../../context/MaterialThemeContext";

function ChooseBlockResponse() {
  const [error, setError] = useState<string>();
  const { gameState, setGameState } = useGameStateContext();
  const { colorMode } = useColorModeContext();

  const { trigger, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8000'}/blockResponse`, (async (url: string, { arg }: { arg: { roomId: string, playerId: string; response: Responses }; }) => {
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
        setError('Error responding to block');
      }
    })
  }));

  if (!gameState) {
    return null;
  }

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
                roomId: gameState.roomId,
                playerId: getPlayerId(),
                response: response as Responses
              })
            }}
            sx={{
              background: responseAttributes.color[colorMode]
            }} variant="contained"
            disabled={isMutating}
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
