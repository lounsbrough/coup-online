import { Box, Typography } from "@mui/material"
import { PublicPlayer } from '@shared'
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function Victory({ player }: { player: PublicPlayer }) {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  return (
    <Box>
      <Typography variant="h1">{t('playerWins', {
        primaryPlayer: player.name,
        gameState
      })}</Typography>
    </Box>
  )
}

export default Victory
