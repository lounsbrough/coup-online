import { Button, Typography } from "@mui/material"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { PlayerActions } from "@shared"
import useGameMutation from "../../hooks/useGameMutation"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function PlayAgain() {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  const { trigger, isMutating, error } = useGameMutation<{
    roomId: string, playerId: string
  }>({ action: PlayerActions.resetGame })

  if (!gameState) {
    return null
  }

  return (
    <>
      <Button
        onClick={() => {
          trigger({
            playerId: getPlayerId(),
            roomId: gameState.roomId
          })
        }}
        variant="contained"
        loading={isMutating}
      >
        {t('playAgain')}
      </Button>
      {error && <Typography color='error' sx={{ fontWeight: 700, mt: 3 }}>{error}</Typography>}
    </>
  )
}

export default PlayAgain
