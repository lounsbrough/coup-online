import React, { useState } from "react";
import { Box, Button, Grid2, TextField, Typography } from "@mui/material";
import { AccountCircle, Group } from "@mui/icons-material";
import useSWRMutation from "swr/mutation";
import { getPlayerId } from "../../helpers/playerId";

function CreateGame() {
  const [roomId, setRoomId] = useState('');
  const [roomIdError, setRoomIdError] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerNameError, setPlayerNameError] = useState('');


  const { trigger, isMutating, error } = useSWRMutation(`${process.env.REACT_API_BASE_URL ?? 'http://localhost:8000'}/createGame`, (async (url: string, { arg }: { arg: { roomId: string; playerId: string; playerName: string; }; }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(res => res.json());
  }))

  return (
    <>
      <Typography variant="h5" sx={{ m: 5 }}>
        Create a New Game
      </Typography>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          trigger({
            roomId: roomId.trim(),
            playerId: getPlayerId(),
            playerName: playerName.trim()
          });
        }}>
        <Grid2 container direction="column" alignContent='center'>
          <Grid2>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 3 }}>
              <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              <TextField
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                label="What is your name?"
                variant="standard"
                required
              />
            </Box>
          </Grid2>
        </Grid2>
        <Grid2>
          <Button type="submit" sx={{ mt: 5 }} variant="contained">Create Game</Button>
        </Grid2>
      </form>
    </>
  )
}

export default CreateGame;
