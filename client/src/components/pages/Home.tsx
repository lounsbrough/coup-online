import { Button, Grid2, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Typography variant="h4" sx={{ m: 5 }}>
        Welcome to Coup!
      </Typography>
      <Typography variant="h5" sx={{ m: 5 }}>
        The game of deception, deduction, and luck.
      </Typography>
      <Grid2>
        <Button
          type="submit" sx={{ mt: 5 }}
          variant="contained"
          onClick={() => { navigate(`/join-game`); }}
        >Join Existing Game</Button>
      </Grid2>
      <Grid2>
        <Button
          type="submit" sx={{ mt: 5 }}
          variant="contained"
          onClick={() => { navigate(`/create-game`); }}
        >Create New Game</Button>
      </Grid2>
    </>
  )
}

export default Home;
