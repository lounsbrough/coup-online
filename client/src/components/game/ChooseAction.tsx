import { Button, Grid2, Tooltip, Typography } from "@mui/material";
import { ActionAttributes, Actions } from "../../shared/types/game";
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { getPlayerId } from "../../helpers/playerId";
import { useGameStateContext } from "../../context/GameStateContext";

function ChooseAction() {
  const [selectedAction, setSelectedAction] = useState<Actions>();
  const [error, setError] = useState<string>();
  const { gameState, setGameState } = useGameStateContext()

  const { trigger, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8000'}/action`, (async (
    url: string, { arg }: {
      arg: {
        roomId: string,
        playerId: string;
        action: Actions,
        targetPlayer?: string
      };
    }) => {
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
        if (res.status === 400) {
          setError(await res.text());
        } else {
          setError('Error choosing action');
        }
      }
    })
  }));

  if (!gameState) {
    return null;
  }

  return (
    <>
      {selectedAction ? (
        <>
          <Typography sx={{ my: 1, fontWeight: 'bold', fontSize: '24px' }}>
            Choose a Target:
          </Typography>
          <Grid2 container spacing={2} justifyContent="center">
            {gameState.players.map((player) => {
              if (player.name === gameState.selfPlayer.name || !player.influenceCount
              ) {
                return null;
              }
              return <Button
                key={player.name}
                onClick={() => {
                  trigger({
                    roomId: gameState.roomId,
                    playerId: getPlayerId(),
                    action: selectedAction,
                    targetPlayer: player.name
                  })
                }} color="inherit" sx={{ background: player.color }}
                disabled={isMutating}
              >{player.name}</Button>
            })}
          </Grid2>
        </>
      ) : (
        <>
          <Typography sx={{ my: 1, fontWeight: 'bold', fontSize: '24px' }}>
            Choose an Action:
          </Typography>
          <Grid2 container spacing={2} justifyContent="center">
            {Object.entries(ActionAttributes)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([action, actionAttributes], index) => {
                const lackingCoins = !!actionAttributes.coinsRequired && gameState.selfPlayer.coins < actionAttributes.coinsRequired;

                if (gameState.selfPlayer.coins >= 10 && action !== Actions.Coup) {
                  return null;
                }

                return (
                  <Grid2 key={index}>
                    {lackingCoins ? (
                      <Tooltip title="Not enough coins">
                        <span>
                          <Button
                            variant="contained"
                            disabled
                          >
                            {action}
                          </Button>
                        </span>
                      </Tooltip>
                    ) : (
                      <Button
                        onClick={() => {
                          if (actionAttributes.requiresTarget) {
                            setSelectedAction(action as Actions);
                          } else {
                            trigger({
                              roomId: gameState.roomId,
                              playerId: getPlayerId(),
                              action: action as Actions
                            })
                          }
                        }}
                        sx={{
                          background: actionAttributes.color
                        }} variant="contained"
                        disabled={isMutating}
                      >
                        {action}
                      </Button>
                    )}
                  </Grid2>
                );
              })}
          </Grid2>
        </>
      )}
      {error && <Typography sx={{ mt: 3, fontWeight: 700, color: 'red' }}>{error}</Typography>}
    </>
  );
}

export default ChooseAction;
