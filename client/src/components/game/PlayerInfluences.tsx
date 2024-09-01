import { Box, Grid2 } from "@mui/material";
import { InfluenceAttributes, Player } from '../../../../shared/types/game'

function PlayerInfluences({ player }: { player: Player }) {
  return (
    <Grid2 container>
      {player.influences.map((influence, index) =>
        <Grid2 key={index}>
          <Box sx={{ background: InfluenceAttributes[influence].color }}>{influence}</Box>
          {influence}
        </Grid2>
      )}
    </Grid2>
  )
}

export default PlayerInfluences;
