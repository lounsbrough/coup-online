import { Box } from "@mui/material"
import { PublicPlayer } from '@shared'
import ColoredTypography from "../utilities/ColoredTypography"

function Victory({ player }: { player: PublicPlayer }) {
  return (
    <Box>
      <ColoredTypography variant="h1">{`${player.name} Wins!`}</ColoredTypography>
    </Box>
  )
}

export default Victory
