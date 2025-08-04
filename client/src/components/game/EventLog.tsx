import { Box, useTheme } from "@mui/material"
import { useEffect, useRef } from "react"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import CoupTypography from '../utilities/CoupTypography'

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
      <CoupTypography sx={{ fontWeight: 700 }} addTextShadow>
        {t('eventLog')}
      </CoupTypography>
      <Box ref={logBox} sx={{
        width: '100%',
        maxHeight: '25dvh',
        [theme.breakpoints.up('md')]: { maxHeight: '75dvh' },
        overflowY: 'auto'
      }}>
        {gameState?.eventLogs.map((log, logIndex) => {
          return (
            <CoupTypography key={logIndex} addTextShadow>
              {t(log.event, {
                action: log.action,
                primaryPlayer: log.primaryPlayer,
                secondaryPlayer: log.secondaryPlayer,
                primaryInfluence: log.influence,
                gameState
              })}
            </CoupTypography>
          )
        })}
      </Box>
    </>
  )
}

export default EventLog
