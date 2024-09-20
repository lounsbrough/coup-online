import { Box, Typography } from "@mui/material"
import { InfluenceAttributes, Influences } from "../../shared/types/game"
import { useColorModeContext } from "../../contexts/MaterialThemeContext"

function InfluenceCard({ influence }: { influence: Influences }) {
  const { colorMode } = useColorModeContext()

  return (
    <Box sx={{
      color: 'white',
      textAlign: 'center',
      background: InfluenceAttributes[influence].color[colorMode],
      borderRadius: 3,
      p: 2,
      width: '8rem',
      height: '2rem'
    }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 'bold' }}
      >{influence}
      </Typography>
    </Box>
  )
}

export default InfluenceCard
