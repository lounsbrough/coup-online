import { Typography } from "@mui/material"
import { getWaitingOnPlayers } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { Circle } from "@mui/icons-material"

function WaitingOnOtherPlayers() {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState?.selfPlayer) {
    return null
  }

  return (
    <>
      <Typography variant="h6" my={1} fontWeight="bold">
        {t('waitingOnOtherPlayers')}
      </Typography>
      <Typography>
        {getWaitingOnPlayers(gameState).map(({ color }) =>
          <Circle key={color} sx={{ color }} />
        )}
      </Typography>
    </>
  )
}

export default WaitingOnOtherPlayers
