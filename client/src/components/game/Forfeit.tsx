import { useState } from "react"
import { Close, Flag } from "@mui/icons-material"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, useTheme } from "@mui/material"
import { PlayerActions } from "@shared"
import { getPlayerId } from "../../helpers/players"
import useGameMutation from "../../hooks/useGameMutation"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import Bot from "../icons/Bot"
import Skull from "../icons/Skull"

const ForfeitIcon = Flag

function Forfeit() {
  const [confirmationOpen, setConfirmationOpen] = useState(false)

  const forfeitMutation = useGameMutation<{
    roomId: string, playerId: string, replaceWithAi: boolean
  }>({
    action: PlayerActions.forfeit, callback: () => {
      setConfirmationOpen(false)
    }
  })

  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const { isSmallScreen } = useTheme()

  if (!gameState?.selfPlayer) {
    return null
  }

  const selfPlayerName = gameState.selfPlayer.name
  const playerIsDead = !gameState.selfPlayer.influences.length
  const gameIsOver = gameState.players.filter(({ influenceCount }) => influenceCount).length === 1
  const playerHasActionsPending =
    (gameState.turnPlayer === selfPlayerName && !!gameState.pendingAction)
    || gameState.pendingAction?.targetPlayer === selfPlayerName
    || gameState.pendingActionChallenge?.sourcePlayer === selfPlayerName
    || gameState.pendingBlock?.sourcePlayer === selfPlayerName
    || gameState.pendingBlockChallenge?.sourcePlayer === selfPlayerName
    || !!gameState.pendingInfluenceLoss[selfPlayerName]?.length
  const forfeitNotPossible = gameIsOver || playerIsDead || playerHasActionsPending

  return (
    <>
      <Box mt={1}>
        {!playerIsDead && (
          <>
            <Tooltip
              title={forfeitNotPossible && t('forfeitNotPossible')}>
              <span>
                <Button
                  color="secondary"
                  variant="contained"
                  size="small"
                  startIcon={<ForfeitIcon />}
                  disabled={forfeitNotPossible}
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
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{
          ...(isSmallScreen && { flexDirection: 'column', alignItems: 'flex-end', gap: 2 })
        }}>
          <Button
            variant="contained"
            startIcon={<Close />}
            onClick={() => { setConfirmationOpen(false) }}
            disabled={forfeitMutation.isMutating}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Skull />}
            color="error"
            onClick={async () => {
              await forfeitMutation.trigger({
                roomId: gameState.roomId,
                playerId: getPlayerId(),
                replaceWithAi: false
              })
            }}
            disabled={forfeitNotPossible}
            loading={forfeitMutation.isMutating}
          >
            {t('forfeitKillInfluences')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Bot />}
            color="error"
            onClick={async () => {
              await forfeitMutation.trigger({
                roomId: gameState.roomId,
                playerId: getPlayerId(),
                replaceWithAi: true
              })
            }}
            disabled={forfeitNotPossible}
            loading={forfeitMutation.isMutating}
          >
            {t('forfeitReplaceWithAi')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Forfeit
