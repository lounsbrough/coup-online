import { ReactNode, useEffect, useRef, useState } from "react"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Button, Grid, Typography, useTheme } from "@mui/material"
import { Cancel, Check } from "@mui/icons-material"
import { LIGHT_COLOR_MODE } from "../../contexts/MaterialThemeContext"
import { confirmActionsStorageKey } from "../../helpers/localStorageKeys"
import { PlayerActions } from "@shared"
import useGameMutation from "../../hooks/useGameMutation"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function PlayerActionConfirmation({
  message,
  action,
  variables,
  onCancel
}: {
  message: ReactNode,
  action: PlayerActions,
  variables: object,
  onCancel: () => void
}) {
  const [autoSubmitProgress, setAutoSubmitProgress] = useState(0)
  const autoSubmitInterval = useRef<ReturnType<typeof setInterval>>(undefined)
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const theme = useTheme()

  const { trigger, isMutating } = useGameMutation<object>({ action })

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
      <Typography variant="h6" my={1} fontWeight="bold">{message}</Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid>
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
          >
            {t('cancel')}
          </Button>
        </Grid>
        <Grid>
          <Button
            startIcon={(
              <Check />
            )}
            sx={{
              color: theme.palette.primary.contrastText,
              background: isMutating ? undefined : `
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
            loading={isMutating}
          >
            {t('confirm')}
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default PlayerActionConfirmation
