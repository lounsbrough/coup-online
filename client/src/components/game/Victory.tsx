import { Box, Typography } from "@mui/material"
import { PublicPlayer } from '@shared'

function Victory({ player }: { player: PublicPlayer }) {
  return (
    <Box>
      <Typography variant="h1">{`${player.name} Wins!`}</Typography>
    </Box>
  )
}

export default Victory
