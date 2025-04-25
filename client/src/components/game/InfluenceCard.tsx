import { Grid2, Paper, Typography, useTheme } from "@mui/material"
import { Influences } from '@shared'
import InfluenceIcon from "../icons/InfluenceIcon"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function InfluenceCard({ influence }: {
  influence: Influences
}) {
  const { t } = useTranslationContext()
  const { influenceColors } = useTheme()

  return (
    <Paper sx={{
      color: 'white',
      textAlign: 'center',
      alignContent: 'center',
      background: influence ? influenceColors[influence] : 'rgba(120, 120, 120, 0.5)',
      borderRadius: '0.5rem',
      p: 2
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
            {t(influence)}
          </Typography>
        </Grid2>
      </Grid2>
    </Paper>
  )
}

export default InfluenceCard
