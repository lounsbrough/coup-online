import { Button, Grid2, Snackbar, Typography, useTheme } from "@mui/material"
import Players from "../game/Players"
import useSWRMutation from "swr/mutation"
import { QRCodeSVG } from 'qrcode.react'
import { ContentCopy } from "@mui/icons-material"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useState } from "react"
import { useWebSocketContext } from "../../contexts/WebSocketContext"
import { LIGHT_COLOR_MODE } from "../../contexts/MaterialThemeContext"

type StartGameParams = { roomId: string, playerId: string }

const startGameEvent = 'startGame'

function WaitingRoom() {
  const [error, setError] = useState('')
  const [showCopiedToClipboardMessage, setShowCopiedToClipboardMessage] = useState(false)
  const { socket } = useWebSocketContext()
  const { gameState, setGameState } = useGameStateContext()
  const theme = useTheme()

  const { trigger: triggerSwr, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/${startGameEvent}`, (async (url: string, { arg }: { arg: StartGameParams }) => {
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
    ? (params: StartGameParams) => {
      socket.removeAllListeners('error').on('error', (error) => { setError(error) })
      socket.emit(startGameEvent, params)
    }
    : triggerSwr

  if (!gameState) {
    return null
  }

  const inviteLink = `${window.location.origin}/join-game?roomId=${gameState.roomId}`

  return (
    <>
      <Typography variant="h5" mt={3}>Room: <strong>{gameState.roomId}</strong></Typography>
      <Grid2 container direction='column' justifyContent="center">
        <Grid2 sx={{ p: 2 }}>
          <Players inWaitingRoom />
        </Grid2>
      </Grid2>
      <Grid2 container direction='column' spacing={2}>
        <Grid2>
          <QRCodeSVG
            bgColor="transparent"
            fgColor={theme.palette.primary[theme.palette.mode === LIGHT_COLOR_MODE ? 'dark' : 'light']}
            value={inviteLink}
          />
        </Grid2>
        <Grid2>
          <Button
            variant="contained"
            startIcon={<ContentCopy />}
            onClick={() => {
              navigator.clipboard.writeText(inviteLink)
              setShowCopiedToClipboardMessage(true)
            }}
          >
            Copy Invite Link
          </Button>
          <Snackbar
            open={showCopiedToClipboardMessage}
            autoHideDuration={5000}
            onClose={() => { setShowCopiedToClipboardMessage(false) }}
            message="Invite link copied"
          />
        </Grid2>
        <Grid2>
          {gameState.players.length <= 1
            ? <Typography>Add at least one more player to start game</Typography>
            : (<Button
              variant='contained'
              onClick={() => {
                trigger({
                  roomId: gameState.roomId,
                  playerId: getPlayerId()
                })
              }}
              disabled={isMutating}
            >
              Start Game
            </Button>
            )}
          {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
        </Grid2>
      </Grid2>
    </>
  )
}

export default WaitingRoom
