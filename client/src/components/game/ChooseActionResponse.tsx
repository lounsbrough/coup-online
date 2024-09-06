import { Button, Grid2, Typography } from "@mui/material";
import { ActionAttributes, Actions, InfluenceAttributes, Influences, ResponseAttributes, Responses } from "../../shared/types/game";
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { getPlayerId } from "../../helpers/playerId";
import { useGameStateContext } from "../../context/GameStateContext";
import { useColorModeContext } from "../../context/MaterialThemeContext";
import GameTypography from "../utilities/GameTypography";

function ChooseActionResponse() {
  const [selectedResponse, setSelectedResponse] = useState<Responses>();
  const [error, setError] = useState<string>();
  const { gameState, setGameState } = useGameStateContext();
  const { colorMode } = useColorModeContext();

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

  if (!gameState?.pendingAction) {
    return null;
  }

  return (
    <>
      {selectedResponse ? (
        <>
          <Typography sx={{ my: 1, fontWeight: 'bold' }}>
            Claim an Influence:
          </Typography>
          <Grid2 container spacing={2} justifyContent="center">
            {Object.entries(InfluenceAttributes)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([influence, influenceAttributes]) => {
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
                  }} sx={{ background: influenceAttributes.color[colorMode] }}
                  disabled={isMutating}
                  variant="contained"
                >{influence}</Button>
              })}
          </Grid2>
        </>
      ) : (
        <>
          <GameTypography sx={{ my: 1, fontWeight: 'bold' }}>
            {`${gameState.turnPlayer} is trying to use ${gameState.pendingAction.action}${gameState.pendingAction.targetPlayer
              ? ` on ${gameState.pendingAction.targetPlayer}`
              : ''}`}
          </GameTypography>
          <Grid2 container spacing={2} justifyContent="center">
            {Object.entries(ResponseAttributes)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([response, responseAttributes], index) => {
                if (response === Responses.Challenge &&
                  !ActionAttributes[gameState.pendingAction?.action as Actions].challengeable) {
                  return null;
                }

                if (response === Responses.Block &&
                  (!ActionAttributes[gameState.pendingAction?.action as Actions].blockable ||
                    (gameState.pendingAction?.targetPlayer &&
                      gameState.selfPlayer.name !== gameState.pendingAction?.targetPlayer
                    ))) {
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
                    background: responseAttributes.color[colorMode]
                  }} variant="contained"
                  disabled={isMutating}
                >
                  {response}
                </Button>
              })}
          </Grid2>
          {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
        </>
      )}
    </>
  );
}

export default ChooseActionResponse;
