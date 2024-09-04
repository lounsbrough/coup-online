import { Breadcrumbs, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import GameBoard from "../game/GameBoard";
import WaitingRoom from "../game/WaitingRoom";
import { useGameStateContext } from "../../context/GameStateContext";

function Game() {
  const { gameState } = useGameStateContext();

  return (
    <>
      <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
        <Link to='/'>Home</Link>
        <Typography>Room {gameState?.roomId}</Typography>
      </Breadcrumbs>
      {!gameState && <Typography>Game state unavailable</Typography>}
      {gameState && !gameState.selfPlayer && (
        <Typography>You are not in this game</Typography>
      )}
      {gameState && gameState.isStarted && gameState.selfPlayer && (
        <GameBoard />
      )}
      {gameState && !gameState.isStarted && gameState.selfPlayer && (
        <WaitingRoom />
      )}
    </>
  )
}

export default Game;
