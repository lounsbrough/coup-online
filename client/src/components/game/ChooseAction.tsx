import { Button, Grid2, Tooltip, Typography } from "@mui/material";
import { ActionAttributes, Actions, PublicGameState } from "../../shared/types/game";
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { getPlayerId } from "../../helpers/playerId";

function ChooseAction({ roomId, gameState }: { roomId: string, gameState: PublicGameState }) {
  const [error, setError] = useState<string | undefined>();

  const { trigger, isMutating, error: swrError } = useSWRMutation(`${process.env.REACT_API_BASE_URL ?? 'http://localhost:8000'}/action`, (async (url: string, { arg }: { arg: { roomId: string, playerId: string; action: Actions }; }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (!res.ok) {
        setError('Error choosing action');
      }
    })
  }))

  return (
    <>
      <Typography sx={{ my: 1, fontWeight: 'bold', fontSize: '24px' }}>
        Choose an Action:
      </Typography>
      <Grid2 container spacing={2}>
        {Object.entries(ActionAttributes)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([action, actionAttributes], index) => {
            const isDisabled = !!actionAttributes.coinsRequired && gameState.selfPlayer.coins < actionAttributes.coinsRequired;

            return (
              <Grid2 key={index}>
                {isDisabled ? (
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
                      trigger({
                        roomId,
                        playerId: getPlayerId(),
                        action: action as Actions
                      })
                    }}
                    sx={{
                      background: actionAttributes.color
                    }} variant="contained" >
                    {action}
                  </Button>
                )}
                {error && <Typography sx={{ mt: 3, fontWeight: 700, color: 'red' }}>{error}</Typography>}
              </Grid2>
            );
          })}
      </Grid2>
    </>
  );
}

export default ChooseAction;
