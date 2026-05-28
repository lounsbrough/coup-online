import { Grid, Paper, Typography, useTheme } from "@mui/material"
import { colord } from 'colord'
import { Influences } from '@shared'
import InfluenceIcon from "../icons/InfluenceIcon"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { CARD_ICON_FILTER, CARD_TEXT_SHADOW } from "../../helpers/styles"

function InfluenceCard({ influence }: {
  influence: Influences
}) {
  const { t } = useTranslationContext()
  const { influenceColors } = useTheme()

  const bgColor = influence ? influenceColors[influence] : 'rgba(120, 120, 120, 0.5)'
  const lightColor = colord(bgColor).lighten(0.4).toHex()
  const textStyle = { color: lightColor, ...CARD_TEXT_SHADOW }
  const iconStyle = { color: lightColor, ...CARD_ICON_FILTER }

  return (
    <Paper sx={{
      textAlign: 'center',
      alignContent: 'center',
      background: bgColor,
      borderRadius: '0.5rem',
      p: 2
    }}>
      <Grid container flexWrap="nowrap" spacing={1} justifyContent="center" alignItems="center">
        <Grid>
          <InfluenceIcon influence={influence} sx={iconStyle} />
        </Grid>
        <Grid>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', fontSize: '1.2rem', ...textStyle }}
          >
            {t(influence)}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default InfluenceCard
