import { Button, Grid2, Typography } from "@mui/material";
import { InfluenceAttributes, Influences } from "../../shared/types/game";
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { getPlayerId } from "../../helpers/playerId";
import { useGameStateContext } from "../../context/GameStateContext";

function ChooseChallengeResponse() {
  const [error, setError] = useState<string>();
  const { gameState, setGameState } = useGameStateContext();

  const { trigger, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8000'}/${gameState?.pendingActionChallenge ? 'actionChallengeResponse' : 'blockChallengeResponse'}`, (async (url: string, { arg }: { arg: { roomId: string, playerId: string; influence: Influences }; }) => {
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
        setError('Error responding to challenge');
      }
    })
  }));

  if (!gameState) {
    return null;
  }

  return (
    <>
      <Typography sx={{ my: 1, fontWeight: 'bold', fontSize: '24px' }}>
        Choose an Influence to Reveal:
      </Typography>
      <Grid2 container spacing={2} justifyContent="center">
        {gameState.selfPlayer.influences.map((influence, index) => {
          return <Button
            key={index}
            onClick={() => {
              trigger({
                roomId: gameState.roomId,
                playerId: getPlayerId(),
                influence: influence as Influences
              })
            }}
            disabled={isMutating}
            sx={{
              background: InfluenceAttributes[influence].color
            }} variant="contained"
          >
            {influence}
          </Button>
        })}
      </Grid2>
      {error && <Typography sx={{ mt: 3, fontWeight: 700, color: 'red' }}>{error}</Typography>}
    </>
  );
}

export default ChooseChallengeResponse;
