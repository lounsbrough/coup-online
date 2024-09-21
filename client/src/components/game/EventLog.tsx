import { Box, Typography, useTheme } from "@mui/material"
import { useEffect, useRef } from "react"
import { useGameStateContext } from "../../contexts/GameStateContext"
import ColoredTypography from "../utilities/ColoredTypography"

function EventLog() {
  const logBox = useRef<HTMLElement>(null)
  const { gameState } = useGameStateContext()
  const theme = useTheme()

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
      <Typography sx={{ mt: 2, fontWeight: 700 }}>Event Log</Typography>
      <Box ref={logBox} sx={{
        width: '100%',
        maxHeight: theme.isSmallScreen ? '25dvh' : '80dvh',
        overflowY: 'auto'
      }}>
        {gameState?.eventLogs.map((log, logIndex) =>
          <ColoredTypography key={logIndex}>{log}</ColoredTypography>
        )}
      </Box>
    </>
  )
}

export default EventLog
