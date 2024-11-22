import { Box, Typography, useTheme } from "@mui/material"
import { useEffect, useRef } from "react"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function EventLog() {
  const logBox = useRef<HTMLElement>(null)
  const { gameState } = useGameStateContext()
  const theme = useTheme()
  const { t } = useTranslationContext()

  useEffect(() => {
    logBox.current?.scrollTo({
      top: logBox.current.scrollHeight,
      behavior: "smooth"
    })
  }, [gameState?.eventLogs?.length])

  if (!gameState) {
    return null
  }

  return (
    <>
      <Typography sx={{ fontWeight: 700 }}>Event Log</Typography>
      <Box ref={logBox} sx={{
        width: '100%',
        maxHeight: '25dvh',
        [theme.breakpoints.up('md')]: { maxHeight: '75dvh' },
        overflowY: 'auto'
      }}>
        {gameState?.eventLogs.map((log, logIndex) => {
          return (
            <Typography key={logIndex}>
              {t(log.event, {
                action: log.action,
                primaryPlayer: log.primaryPlayer,
                secondaryPlayer: log.secondaryPlayer,
                influence: log.influence
              })}
            </Typography>
          )
        })}
      </Box>
    </>
  )
}

export default EventLog
