import { Button, Grid2, Typography } from "@mui/material";
import { InfluenceAttributes, Influences } from "../../shared/types/game";
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { getPlayerId } from "../../helpers/playerId";
import { useGameStateContext } from "../../context/GameStateContext";
import { useColorModeContext } from "../../context/MaterialThemeContext";

function ChooseChallengeResponse() {
  const [error, setError] = useState<string>();
  const { gameState, setGameState } = useGameStateContext();
  const { colorMode } = useColorModeContext();

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

  if (!gameState?.pendingActionChallenge && !gameState?.pendingBlockChallenge) {
    return null;
  }

  const challengingPlayer = gameState.players.find((player) =>
    player.name === gameState.pendingBlockChallenge?.sourcePlayer ||
    player.name === gameState.pendingActionChallenge?.sourcePlayer
  );

  const challengedPlayer = gameState.players.find((player) =>
    player.name === gameState.pendingBlock?.sourcePlayer ||
    player.name === gameState.turnPlayer
  );

  return (
    <>
      <Typography sx={{ my: 1, fontWeight: 'bold', fontSize: '24px' }}>
        <Typography component="span" fontSize='inherit' fontWeight='inherit'
          sx={{ color: challengingPlayer?.color }}
        >
          {challengingPlayer?.name}
        </Typography>
        <Typography component="span" fontSize='inherit' fontWeight='inherit'>
          {' is challenging '}
        </Typography>
        <Typography component="span" fontSize='inherit' fontWeight='inherit'
          sx={{ color: challengedPlayer?.color }}
        >{challengedPlayer?.name}</Typography>
      </Typography>
      <Typography  sx={{ my: 1, fontWeight: 'bold', fontSize: '24px' }}>
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
              background: InfluenceAttributes[influence].color[colorMode]
            }} variant="contained"
          >
            {influence}
          </Button>
        })}
      </Grid2>
      {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
    </>
  );
}

export default ChooseChallengeResponse;
