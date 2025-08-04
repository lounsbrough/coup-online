import { Box } from "@mui/material"
import { getWaitingOnPlayers } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { Circle } from "@mui/icons-material"
import CoupTypography from '../utilities/CoupTypography'

function WaitingOnOtherPlayers() {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState?.selfPlayer) {
    return null
  }

  return (
    <>
      <CoupTypography variant="h6" my={1} fontWeight="bold" addTextShadow>
        {t('waitingOnOtherPlayers')}
      </CoupTypography>
      <Box>
        {getWaitingOnPlayers(gameState).map(({ color }) =>
          <Circle key={color} sx={{ color }} />
        )}
      </Box>
    </>
  )
}

export default WaitingOnOtherPlayers
