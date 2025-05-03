import { Flag } from "@mui/icons-material"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material"
import { PlayerActions } from "@shared"
import { getPlayerId } from "../../helpers/players"
import useGameMutation from "../../hooks/useGameMutation"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { useState } from "react"

const ForfeitIcon = Flag

function Forfeit() {
  const [confimrationOpen, setConfirmationOpen] = useState(false)

  const forfeitMutation = useGameMutation<{
    roomId: string, playerId: string
  }>({ action: PlayerActions.forfeit })

  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState) {
    return null
  }

  const selfPlayerName = gameState.selfPlayer?.name
  const playerIsDead = !gameState.selfPlayer?.influences.length
  const playerHasActionsPending =
    (gameState.turnPlayer === selfPlayerName && !!gameState.pendingAction)
    || gameState.pendingActionChallenge?.sourcePlayer === selfPlayerName
    || gameState.pendingBlock?.sourcePlayer === selfPlayerName
    || gameState.pendingBlockChallenge?.sourcePlayer === selfPlayerName

  return (
    <>
      <Box mt={1}>
        {!playerIsDead && (
          <>
            <Button
              size="small"
              startIcon={<ForfeitIcon />}
              variant='outlined'
              disabled={playerHasActionsPending}
              onClick={() => { setConfirmationOpen(true) }}
            >
              {t('forfeit')}
            </Button>
            {forfeitMutation.error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{forfeitMutation.error}</Typography>}
          </>
        )}
      </Box>
      <Dialog
        open={confimrationOpen}
        onClose={() => { setConfirmationOpen(false) }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('forfeitConfirmationTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('forfeitConfirmationMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => { setConfirmationOpen(false) }}
            disabled={forfeitMutation.isMutating}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await forfeitMutation.trigger({
                roomId: gameState.roomId,
                playerId: getPlayerId()
              })
              setConfirmationOpen(false)
            }}
            disabled={playerHasActionsPending}
            loading={forfeitMutation.isMutating}
          >
            {t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Forfeit
