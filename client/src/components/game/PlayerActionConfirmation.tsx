import { useEffect, useMemo, useRef, useState } from "react"
import { useGameStateContext } from "../../contexts/GameStateContext"
import useSWRMutation from "swr/mutation"
import { Button, Grid2, Typography, useTheme } from "@mui/material"
import ColoredTypography from "../utilities/ColoredTypography"
import { Cancel, Check } from "@mui/icons-material"
import { LIGHT_COLOR_MODE } from "../../contexts/MaterialThemeContext"
import { confirmActionsStorageKey } from "../../helpers/localStorageKeys"
import { useWebSocketContext } from "../../contexts/WebSocketContext"

function PlayerActionConfirmation({
  message,
  endpoint,
  variables,
  onCancel
}: {
  message: string,
  endpoint: string,
  variables: object,
  onCancel: () => void
}) {
  const [error, setError] = useState('')
  const [autoSubmitProgress, setAutoSubmitProgress] = useState(0)
  const autoSubmitInterval = useRef<NodeJS.Timer>()
  const { socket } = useWebSocketContext()
  const { gameState, setGameState } = useGameStateContext()
  const theme = useTheme()

  const { trigger: triggerSwr, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/${endpoint}`, (async (url: string, { arg }: { arg: object }) => {
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
        if (res.status === 400) {
          setError(await res.text())
        } else {
          setError('Error performing action')
        }
      }
    })
  }))

  const trigger = useMemo(() => socket?.connected
    ? (params: object) => {
      socket.removeAllListeners('error').on('error', (error) => { setError(error) })
      socket.emit(endpoint, params)
    }
    : triggerSwr, [endpoint, socket, triggerSwr])

  const skipConfirmation = !JSON.parse(localStorage.getItem(confirmActionsStorageKey) ?? JSON.stringify(true))

  useEffect(() => {
    if (skipConfirmation) {
      trigger(variables)
    } else {
      autoSubmitInterval.current = setInterval(() => {
        setAutoSubmitProgress((prev) => Math.min(100, prev + 1))
      }, 50)
    }

    return () => {
      clearInterval(autoSubmitInterval.current)
      autoSubmitInterval.current = undefined
    }
  }, [skipConfirmation, trigger, variables])

  useEffect(() => {
    if (autoSubmitInterval.current && autoSubmitProgress === 100) {
      clearInterval(autoSubmitInterval.current)
      autoSubmitInterval.current = undefined
      trigger(variables)
    }
  }, [autoSubmitProgress, trigger, variables])

  if (!gameState || skipConfirmation) {
    return null
  }

  return (
    <>
      <ColoredTypography my={1} fontWeight="bold">{message}</ColoredTypography>
      <Grid2 container spacing={2} justifyContent="center">
        <Grid2>
          <Button
            startIcon={<Cancel />}
            variant="contained"
            onClick={() => {
              clearInterval(autoSubmitInterval.current)
              autoSubmitInterval.current = undefined
              setAutoSubmitProgress(100)
              onCancel()
            }}
            disabled={isMutating}
          >Cancel</Button>
        </Grid2>
        <Grid2>
          <Button
            startIcon={(
              <Check />
            )}
            sx={{
              color: theme.palette.primary.contrastText,
              background: `
                linear-gradient(
                  to right,
                  ${theme.palette.primary.main}
                  ${autoSubmitProgress}%,
                  ${theme.palette.mode === LIGHT_COLOR_MODE ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.24)'}
                  ${autoSubmitProgress}%
                ) !important`
            }}
            variant="contained"
            onClick={() => {
              clearInterval(autoSubmitInterval.current)
              autoSubmitInterval.current = undefined
              setAutoSubmitProgress(100)
              trigger(variables)
            }}
            disabled={isMutating}
          >
            Confirm
          </Button>
        </Grid2>
      </Grid2>
      {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
    </>
  )
}

export default PlayerActionConfirmation
