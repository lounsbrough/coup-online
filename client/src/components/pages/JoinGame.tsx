import { useState } from "react";
import { Box, Breadcrumbs, Button, Grid2, TextField, Typography } from "@mui/material";
import { AccountCircle, Group } from "@mui/icons-material";
import useSWRMutation from "swr/mutation";
import { Link } from "react-router-dom";

function JoinGame() {
  const [roomId, setRoomId] = useState('');
  const [roomIdError, setRoomIdError] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerNameError, setPlayerNameError] = useState('');


  const { trigger, isMutating, error } = useSWRMutation(`${process.env.REACT_API_BASE_URL}/joinGame`, (async (url: string, { arg }: { arg: { roomId: string; playerName: string; }; }) => {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(arg)
    }).then(res => res.json());
  }))

  return (
    <>
      <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
        <Link to='/'>Home</Link>
        <Typography>Join Game</Typography>
      </Breadcrumbs>
      <Typography variant="h5" sx={{ m: 5 }}>
        Join an Existing Game
      </Typography>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          trigger({
            roomId: roomId.trim(),
            playerName: playerName.trim()
          });
        }}>
        <Grid2 container direction="column" alignContent='center'>
          <Grid2>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Group sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              <TextField
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)}
                label="Room Id"
                variant="standard"
                required
              />
            </Box>
          </Grid2>
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
          <Button type="submit" sx={{ mt: 5 }} variant="contained">Join Game</Button>
        </Grid2>
      </form>
    </>
  )
}

export default JoinGame;
