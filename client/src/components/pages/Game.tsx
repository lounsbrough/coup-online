import { Typography } from "@mui/material";
import GameBoard from "../game/GameBoard";
import WaitingRoom from "../game/WaitingRoom";
import { useGameStateContext } from "../../contexts/GameStateContext";

function Game() {
  const { gameState } = useGameStateContext();

  return (
    <>
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
