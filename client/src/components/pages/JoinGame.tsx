import { useState } from "react";
import { Box, Breadcrumbs, Button, Grid2, TextField, Typography } from "@mui/material";
import { AccountCircle, Group } from "@mui/icons-material";
import useSWRMutation from "swr/mutation";
import { Link, useNavigate } from "react-router-dom";
import { getPlayerId } from "../../helpers/playerId";

function JoinGame() {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();


  const { trigger } = useSWRMutation(`${process.env.REACT_API_BASE_URL ?? 'http://localhost:8000'}/joinGame`, (async (url: string, { arg }: { arg: { roomId: string; playerId: string, playerName: string; }; }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (res.ok) {
        navigate(`/game?roomId=${roomId}`);
      } else {
        setError(true);
      }
    });
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
            playerId: getPlayerId(),
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
        {error && <Typography sx={{ mt: 3, fontWeight: 700, color: 'red' }}>Error joining game</Typography>}
      </form>
    </>
  )
}

export default JoinGame;
