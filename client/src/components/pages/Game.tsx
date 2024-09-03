import { Breadcrumbs, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import GameBoard from "../game/GameBoard";

function Game() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roomId = searchParams.get('roomId');

  if (!roomId) {
    navigate('/');
    return null;
  }

  return (
    <>
      <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
        <Link to='/'>Home</Link>
        <Typography>Room {roomId}</Typography>
      </Breadcrumbs>
      <GameBoard />
    </>
  )
}

export default Game;
