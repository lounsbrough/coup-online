import { Button, Grid2, Typography } from "@mui/material";
import { InfluenceAttributes, ResponseAttributes, Responses } from "../../shared/types/game";
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

  if (!gameState?.pendingBlock) {
    return null;
  }

  return (
    <>
      <Typography sx={{ my: 1, fontWeight: 'bold', fontSize: '24px' }}>
        <Typography
          component="span" fontSize='inherit' fontWeight='inherit'
          sx={{ color: gameState.players.find((player) => player.name === gameState.pendingBlock?.sourcePlayer)?.color }}
        >{gameState.pendingBlock.sourcePlayer}</Typography>
        <Typography component="span" fontSize='inherit' fontWeight='inherit'>
          {' is trying to block '}
        </Typography>
        <Typography component="span" fontSize='inherit' fontWeight='inherit'
          sx={{ color: gameState.players.find((player) => player.name === gameState.turnPlayer)?.color }}
        >{gameState.turnPlayer}</Typography>
        {gameState.pendingBlock.claimedInfluence && (
          <>
            <Typography component="span" fontSize="inherit" fontWeight='inherit'>
              {' as '}
            </Typography>
            <Typography component="span" fontSize='inherit' fontWeight='inherit'
              sx={{ color: InfluenceAttributes[gameState.pendingBlock.claimedInfluence].color[colorMode] }}
            >{gameState.pendingBlock.claimedInfluence}</Typography>
          </>
        )}
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
      {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
    </>
  );
}

export default ChooseBlockResponse;
