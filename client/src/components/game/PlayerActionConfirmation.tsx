import { useEffect, useState } from "react"
import { useGameStateContext } from "../../context/GameStateContext"
import useSWRMutation from "swr/mutation"
import { Button, CircularProgress, Grid2, Typography } from "@mui/material"
import ColoredTypography from "../utilities/ColoredTypography"
import { Cancel } from "@mui/icons-material"

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
  const [error, setError] = useState<string>()
  const [autoSubmitProgress, setAutoSubmitProgress] = useState<number>(0)
  const [autoSubmitInterval, setAutoSubmitInterval] = useState<NodeJS.Timer>()
  const { gameState, setGameState } = useGameStateContext()

  const { trigger, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/${endpoint}`, (async (url: string, { arg }: { arg: object }) => {
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
        setError('Error performing action')
      }
    })
  }))

  useEffect(() => {
    setAutoSubmitInterval(setInterval(() => {
      setAutoSubmitProgress((prev) => {
        const newProgress = Math.min(100, prev + 5)
        if (newProgress === 100) {
          trigger(variables)
          clearInterval(autoSubmitInterval)
        }
        return newProgress
      })
    }, 100))

    return () => {
      clearInterval(autoSubmitInterval)
    }
  }, [])

  if (!gameState) {
    return null
  }

  return (
    <>
      <ColoredTypography>{message}</ColoredTypography>
      <Grid2 mt={2} container spacing={2}>
        <Grid2>
          <Button
            color="error"
            startIcon={<Cancel />}
            variant="contained"
            onClick={() => {
              clearInterval(autoSubmitInterval)
              onCancel()
            }}
            disabled={isMutating}
          >Cancel</Button>
        </Grid2>
        <Grid2>
          <Button
            color="success"
            startIcon={(
              <CircularProgress
                variant="determinate"
                value={autoSubmitProgress}
                size={20}
                color="inherit"
              />
            )}
            variant="contained"
            onClick={() => {
              clearInterval(autoSubmitInterval)
              trigger(variables)
            }}
            disabled={isMutating}
          >Confirm</Button>
        </Grid2>
      </Grid2>
      {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
    </>
  )
}

export default PlayerActionConfirmation
