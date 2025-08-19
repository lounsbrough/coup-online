import { ReactNode, useEffect, useRef, useState } from "react"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Button, Grid, useTheme } from "@mui/material"
import { Cancel, Check } from "@mui/icons-material"
import { LIGHT_COLOR_MODE } from "../../contexts/MaterialThemeContext"
import { PlayerActions } from "@shared"
import useGameMutation from "../../hooks/useGameMutation"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { useUserSettingsContext } from "../../contexts/UserSettingsContext"
import CoupTypography from '../utilities/CoupTypography'

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
  const { confirmActions } = useUserSettingsContext()

  useEffect(() => {
    if (confirmActions) {
      autoSubmitInterval.current = setInterval(() => {
        setAutoSubmitProgress((prev) => Math.min(100, prev + 1))
      }, 50)
    } else {
      trigger(variables)
    }

    return () => {
      clearInterval(autoSubmitInterval.current)
      autoSubmitInterval.current = undefined
    }
  }, [confirmActions, trigger, variables])

  useEffect(() => {
    if (autoSubmitInterval.current && autoSubmitProgress === 100) {
      clearInterval(autoSubmitInterval.current)
      autoSubmitInterval.current = undefined
      trigger(variables)
    }
  }, [autoSubmitProgress, trigger, variables])

  if (!gameState || !confirmActions) {
    return null
  }

  return (
    <>
      <CoupTypography variant="h6" my={1} fontWeight="bold" addTextShadow>
        {message}
      </CoupTypography>
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
