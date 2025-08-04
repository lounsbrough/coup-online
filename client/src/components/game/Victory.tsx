import { Box } from "@mui/material"
import { PublicPlayer } from '@shared'
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import CoupTypography from '../utilities/CoupTypography'

function Victory({ player }: { player: PublicPlayer }) {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  return (
    <Box>
      <CoupTypography variant="h1" addTextShadow>
        {t('playerWins', {
          primaryPlayer: player.name,
          gameState
        })}
      </CoupTypography>
    </Box>
  )
}

export default Victory
