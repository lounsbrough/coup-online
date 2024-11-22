import { Close, Delete } from "@mui/icons-material"
import { Box, Button, Grid2, Typography, useTheme } from "@mui/material"
import { PlayerActions } from "@shared"
import { getPlayerId } from "../../helpers/players"
import useGameMutation from "../../hooks/useGameMutation"
import { useGameStateContext } from "../../contexts/GameStateContext"

const ResetIcon = Delete

function RequestReset() {
  const resetGameRequest = useGameMutation<{
    roomId: string, playerId: string
  }>({ action: PlayerActions.resetGameRequest })

  const resetGameRequestCancel = useGameMutation<{
    roomId: string, playerId: string
  }>({ action: PlayerActions.resetGameRequestCancel })

  const resetGame = useGameMutation<{
    roomId: string, playerId: string
  }>({ action: PlayerActions.resetGame })

  const { gameState } = useGameStateContext()
  const theme = useTheme()

  if (!gameState) {
    return null
  }

  const isResetPending = !!gameState.resetGameRequest
  const isResetMine = isResetPending && gameState.resetGameRequest?.player === gameState.selfPlayer?.name
  const playerIsDead = !gameState.selfPlayer?.influences.length

  return (
    <>
      <Box mt={1}>
        {(!isResetPending || isResetMine || playerIsDead) && (
          <>
            <Button
              size="small"
              startIcon={<ResetIcon />}
              variant='outlined'
              onClick={() => {
                resetGameRequest.trigger({
                  roomId: gameState.roomId,
                  playerId: getPlayerId()
                })
              }}
              disabled={resetGameRequest.isMutating || isResetPending}
            >
              {!isResetPending ? 'Reset Game' : 'Waiting For Others'}
            </Button>
            {resetGameRequest.error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{resetGameRequest.error}</Typography>}
          </>
        )}
      </Box>
      {isResetPending && !isResetMine && !playerIsDead && (
        <>
          <Typography>
            {`${gameState.resetGameRequest!.player} wants to reset the game`}
          </Typography>
          <Grid2 mt={1} container spacing={1}
            sx={{
              justifyContent: 'center',
              [theme.breakpoints.up('md')]: { justifyContent: 'flex-end' }
            }}>
            <Grid2>
              <Button
                size="small"
                variant="contained"
                startIcon={<Close />}
                disabled={resetGameRequestCancel.isMutating}
                onClick={() => {
                  resetGameRequestCancel.trigger({
                    roomId: gameState.roomId,
                    playerId: getPlayerId()
                  })
                }}
              >
                Cancel
              </Button>
              {resetGameRequestCancel.error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{resetGameRequestCancel.error}</Typography>}
            </Grid2>
            <Grid2>
              <Button
                color="error"
                size="small"
                variant="contained"
                startIcon={<ResetIcon />}
                disabled={resetGame.isMutating}
                onClick={() => {
                  resetGame.trigger({
                    roomId: gameState.roomId,
                    playerId: getPlayerId()
                  })
                }}
              >
                Reset
              </Button>
              {resetGame.error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{resetGame.error}</Typography>}
            </Grid2>
          </Grid2>
        </>
      )}
    </>
  )
}

export default RequestReset
