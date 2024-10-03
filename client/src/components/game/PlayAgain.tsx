import { useState } from "react"
import { Button, Typography } from "@mui/material"
import useSWRMutation from "swr/mutation"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useWebSocketContext } from "../../contexts/WebSocketContext"
import { PlayerActions, ServerEvents } from "@shared"

type ResetGameParams = { roomId: string, playerId: string }

function PlayAgain() {
  const [error, setError] = useState('')
  const { socket } = useWebSocketContext()
  const { gameState, setGameState } = useGameStateContext()

  const { trigger: triggerSwr, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/${PlayerActions.resetGame}`, (async (url: string, { arg }: { arg: ResetGameParams }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (res.ok) {
        setGameState(await res.json())
      } else {
        setError('Error starting new game')
      }
    })
  }))

  const trigger = socket?.connected
    ? (params: ResetGameParams) => {
      socket.removeAllListeners(ServerEvents.error).on(ServerEvents.error, (error) => { setError(error) })
      socket.emit(PlayerActions.resetGame, params)
    }
    : triggerSwr

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
