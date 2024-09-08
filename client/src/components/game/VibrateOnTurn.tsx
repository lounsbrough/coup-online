import { useEffect } from "react";
import { useGameStateContext } from "../../context/GameStateContext";

function VibrateOnTurn() {
  const { gameState } = useGameStateContext();

  useEffect(() => {
    if (gameState?.turnPlayer === gameState?.selfPlayer.name) {
      navigator.vibrate(200);
    }
  }, [gameState?.turnPlayer]);

  return null;
}

export default VibrateOnTurn;
