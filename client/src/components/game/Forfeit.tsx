import { Flag } from "@mui/icons-material"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, Typography } from "@mui/material"
import { PlayerActions } from "@shared"
import { getPlayerId } from "../../helpers/players"
import useGameMutation from "../../hooks/useGameMutation"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { useEffect, useState } from "react"

const ForfeitIcon = Flag

function Forfeit() {
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [error, setError] = useState('')

  const forfeitMutation = useGameMutation<{
    roomId: string, playerId: string
  }>({
    action: PlayerActions.forfeit, callback: () => {
      setConfirmationOpen(false)
    }
  })

  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  useEffect(() => {
    if (!confirmationOpen) setError('')
  }, [confirmationOpen])

  useEffect(() => {
    if (forfeitMutation.error) setError(forfeitMutation.error)
  }, [forfeitMutation.error])

  if (!gameState?.selfPlayer) {
    return null
  }

  const selfPlayerName = gameState.selfPlayer.name
  const playerIsDead = !gameState.selfPlayer.influences.length
  const playerHasActionsPending =
    (gameState.turnPlayer === selfPlayerName && !!gameState.pendingAction)
    || gameState.pendingActionChallenge?.sourcePlayer === selfPlayerName
    || gameState.pendingBlock?.sourcePlayer === selfPlayerName
    || gameState.pendingBlockChallenge?.sourcePlayer === selfPlayerName
    || gameState.selfPlayer.influences.length > 2

  return (
    <>
      <Box mt={1}>
        {!playerIsDead && (
          <>
            <Tooltip
              title={playerHasActionsPending && t('forfeitNotPossible')}>
              <span>
                <Button
                  size="small"
                  startIcon={<ForfeitIcon />}
                  variant='outlined'
                  disabled={playerHasActionsPending}
                  onClick={() => { setConfirmationOpen(true) }}
                >
                  {t('forfeit')}
                </Button>
              </span>
            </Tooltip>
          </>
        )}
      </Box>
      <Dialog
        open={confirmationOpen}
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
            {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
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
