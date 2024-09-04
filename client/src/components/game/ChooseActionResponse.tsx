import { Button, Grid2, Typography } from "@mui/material";
import { ActionAttributes, Actions, InfluenceAttributes, Influences, PublicGameState, ResponseAttributes, Responses } from "../../shared/types/game";
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { getPlayerId } from "../../helpers/playerId";
import { useGameStateContext } from "../../context/GameStateContext";

function ChooseActionResponse() {
  const [selectedResponse, setSelectedResponse] = useState<Responses>();
  const [error, setError] = useState<string>();
  const { gameState, setGameState } = useGameStateContext();

  const { trigger, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8000'}/actionResponse`, (async (url: string, { arg }: { arg: { roomId: string, playerId: string; response: Responses, claimedInfluence?: Influences }; }) => {
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
        setError('Error responding to action');
      }
    })
  }))

  if (!gameState) {
    return null;
  }

  return (
    <>
      {selectedResponse ? (
        <>
          <Typography sx={{ my: 1, fontWeight: 'bold', fontSize: '24px' }}>
            Claim an Influence:
          </Typography>
          <Grid2 container spacing={2} justifyContent="center">
            {Object.entries(InfluenceAttributes).map(([influence, influenceAttributes]) => {
              if (influenceAttributes.legalBlock !== gameState.pendingAction?.action) {
                return null
              }

              return <Button
                key={influence}
                onClick={() => {
                  trigger({
                    roomId: gameState.roomId,
                    playerId: getPlayerId(),
                    response: selectedResponse,
                    claimedInfluence: influence as Influences
                  })
                }} color="inherit" sx={{ background: influenceAttributes.color }}
                disabled={isMutating}
                variant="contained"
              >{influence}</Button>
            })}
          </Grid2>
        </>
      ) : (
        <>
          <Typography sx={{ my: 1, fontWeight: 'bold', fontSize: '24px' }}>
            Choose a Response:
          </Typography>
          <Grid2 container spacing={2} justifyContent="center">
            {Object.entries(ResponseAttributes).map(([response, responseAttributes], index) => {
              if (response === Responses.Challenge &&
                !ActionAttributes[gameState.pendingAction?.action as Actions].challengeable) {
                return null;
              }

              if (response === Responses.Block &&
                !ActionAttributes[gameState.pendingAction?.action as Actions].blockable) {
                return null;
              }

              return <Button
                key={index}
                onClick={() => {
                  if (response === Responses.Block) {
                    setSelectedResponse(response);
                  } else {
                    trigger({
                      roomId: gameState.roomId,
                      playerId: getPlayerId(),
                      response: response as Responses
                    })
                  }
                }}
                sx={{
                  background: responseAttributes.color
                }} variant="contained"
                disabled={isMutating}
              >
                {response}
              </Button>
            })}
          </Grid2>
          {error && <Typography sx={{ mt: 3, fontWeight: 700, color: 'red' }}>{error}</Typography>}
        </>
      )}
    </>
  );
}

export default ChooseActionResponse;
