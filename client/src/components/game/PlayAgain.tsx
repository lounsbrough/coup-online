import { Button, Typography } from "@mui/material"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { PlayerActions } from "@shared"
import useGameMutation from "../../hooks/useGameMutation"

function PlayAgain() {
  const { gameState } = useGameStateContext()

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
            roomId: gameState.roomId,
            playerId: getPlayerId()
          })
        }}
        variant="contained"
        disabled={isMutating}
      >Play Again</Button>
      {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
    </>
  )
}

export default PlayAgain
