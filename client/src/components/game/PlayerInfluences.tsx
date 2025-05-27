import { Grid } from "@mui/material"
import { useGameStateContext } from "../../contexts/GameStateContext"
import InfluenceCard from "./InfluenceCard"

function PlayerInfluences() {
  const { gameState } = useGameStateContext()

  if (!gameState?.selfPlayer?.influences?.length) {
    return null
  }

  return (
    <Grid
      container
      justifyContent="center"
      spacing={3}
      sx={{ width: '100%', maxWidth: '30rem' }}
    >
      {gameState.selfPlayer.influences
        .sort((a, b) => a.localeCompare(b))
        .map((influence, index) => (
          <Grid key={`${influence}-${index}`} size={{ xs: 6 }}>
            <InfluenceCard influence={influence} />
          </Grid>
        ))}
    </Grid>
  )
}

export default PlayerInfluences
