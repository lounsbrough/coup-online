import { Grid2 } from "@mui/material";
import { useGameStateContext } from "../../context/GameStateContext";
import InfluenceCard from "./InfluenceCard";

function PlayerInfluences() {
  const { gameState } = useGameStateContext();

  if (!gameState?.selfPlayer?.influences?.length) {
    return null;
  }

  return (
    <>
      <Grid2 container justifyContent="center" spacing={2}>
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) =>
            <InfluenceCard key={index} influence={influence} />)}
      </Grid2>
    </>
  )
}

export default PlayerInfluences;
