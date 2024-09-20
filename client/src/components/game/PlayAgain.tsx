import { useState } from "react"
import { Button, Typography } from "@mui/material"
import useSWRMutation from "swr/mutation"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useWebSocketContext } from "../../contexts/WebSocketContext"

type ResetGameParams = { roomId: string, playerId: string }

const resetGameEvent = 'resetGame'

function PlayAgain() {
  const [error, setError] = useState<string>()
  const { socket } = useWebSocketContext()
  const { gameState, setGameState } = useGameStateContext()

  const { trigger: triggerSwr, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/${resetGameEvent}`, (async (url: string, { arg }: { arg: ResetGameParams }) => {
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
      socket.removeAllListeners('error').on('error', (error) => { setError(error) })
      socket.emit(resetGameEvent, params)
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
