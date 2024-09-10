import { Button, Grid2, Typography } from "@mui/material";
import { InfluenceAttributes, Influences } from "../../shared/types/game";
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { getPlayerId } from "../../helpers/playerId";
import { useGameStateContext } from "../../context/GameStateContext";
import { useColorModeContext } from "../../context/MaterialThemeContext";
import ColoredTypography from "../utilities/ColoredTypography";

function ChooseChallengeResponse() {
  const [error, setError] = useState<string>();
  const { gameState, setGameState } = useGameStateContext();
  const { colorMode } = useColorModeContext();

  const { trigger, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/${gameState?.pendingActionChallenge ? 'actionChallengeResponse' : 'blockChallengeResponse'}`, (async (url: string, { arg }: { arg: { roomId: string, playerId: string; influence: Influences }; }) => {
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

  const challengingPlayer = gameState.pendingBlockChallenge?.sourcePlayer || gameState.pendingActionChallenge?.sourcePlayer;
  const challengedPlayer = gameState.pendingBlock?.sourcePlayer || gameState.turnPlayer;

  return (
    <>
      <ColoredTypography sx={{ my: 1, fontWeight: 'bold' }}>
        {`${challengingPlayer} is challenging ${challengedPlayer}`}
      </ColoredTypography>
      <Typography sx={{ my: 1, fontWeight: 'bold' }}>
        Choose an Influence to Reveal
      </Typography>
      {gameState.pendingBlock?.claimedInfluence && (
        <ColoredTypography sx={{ my: 1, fontWeight: 'bold' }}>
          {`${gameState.pendingBlock?.claimedInfluence} was claimed`}
        </ColoredTypography>
      )}
      <Grid2 container spacing={2} justifyContent="center">
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) => {
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
