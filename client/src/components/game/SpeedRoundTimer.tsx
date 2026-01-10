import React, { useState, useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useGameStateContext } from '../../contexts/GameStateContext'

const size = 80

const SpeedRoundTimer: React.FC = () => {
  const { gameState } = useGameStateContext()

  const speedRoundSeconds = gameState?.settings?.speedRoundSeconds
  const lastEventTimestamp = gameState?.lastEventTimestamp
  const initialMs = (speedRoundSeconds ?? 0) * 1000

  const [msRemaining, setMsRemaining] = useState<number>(0)

  useEffect(() => {
    if (!lastEventTimestamp || !initialMs) return

    const updateTimer = () => {
      const startTime = typeof lastEventTimestamp === 'number'
        ? lastEventTimestamp
        : lastEventTimestamp.getTime()

      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, initialMs - elapsed)

      setMsRemaining(remaining)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 50)

    return () => clearInterval(timer)
  }, [lastEventTimestamp, initialMs])

  if (!gameState || !speedRoundSeconds || msRemaining <= 0) {
    return null
  }

  const progress = (msRemaining / initialMs) * 100
  const displaySeconds = Math.ceil(msRemaining / 1000)
  const hue = (msRemaining / initialMs) * 120
  const currentColor = `hsl(${hue}, 85%, 45%)`

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        animation: 'pulseTimer 1.5s infinite',
        "@keyframes pulseTimer": {
          "0%": { transform: 'scale(1)' },
          "50%": { transform: 'scale(1.06)' },
          "100%": { transform: 'scale(1)' }
        },
      }}
    >
      <CircularProgress
        variant="determinate"
        value={progress}
        size={size}
        thickness={4.5}
        enableTrackSlot
        sx={{
          color: currentColor,
          transition: 'color 0.1s linear',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: currentColor,
            transition: 'color 0.1s linear',
            fontWeight: 800,
            fontSize: `${size * 0.4}px`,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            userSelect: 'none'
          }}
        >
          {displaySeconds}
        </Typography>
      </Box>
    </Box>
  )
}

export default SpeedRoundTimer
