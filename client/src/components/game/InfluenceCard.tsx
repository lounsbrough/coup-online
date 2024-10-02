import { Box, Grid2, Typography, useTheme } from "@mui/material"
import { Influences } from '@shared'
import InfluenceIcon from "../icons/InfluenceIcon"

function InfluenceCard({ influence }: {
  influence: Influences
}) {
  const { influenceColors } = useTheme()

  return (
    <Box sx={{
      color: 'white',
      textAlign: 'center',
      alignContent: 'center',
      background: influence ? influenceColors[influence] : 'rgba(120, 120, 120, 0.5)',
      borderRadius: '0.5rem',
      p: 2,
      width: '9rem',
      aspectRatio: 4
    }}>
      <Grid2 container flexWrap="nowrap" spacing={1} justifyContent="center" alignItems="center">
        <Grid2>
          <InfluenceIcon influence={influence} />
        </Grid2>
        <Grid2>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}
          >
            {influence}
          </Typography>
        </Grid2>
      </Grid2>
    </Box>
  )
}

export default InfluenceCard
