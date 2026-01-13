import React, { useState, useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useGameStateContext } from '../../contexts/GameStateContext'

const size = 60

const SpeedRoundTimer: React.FC = () => {
  const { gameState } = useGameStateContext()

  const lastEventTimestamp = gameState?.lastEventTimestamp
  const speedRoundMs = (gameState?.settings?.speedRoundSeconds ?? 0) * 1000

  const [msRemaining, setMsRemaining] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!lastEventTimestamp || !speedRoundMs) return

    const updateTimer = () => {
      const startTime =
        typeof lastEventTimestamp === 'number'
          ? lastEventTimestamp
          : lastEventTimestamp.getTime()

      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, speedRoundMs - elapsed)

      setMsRemaining(remaining)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 100)

    return () => clearInterval(timer)
  }, [lastEventTimestamp, speedRoundMs])

  if (!gameState || !speedRoundMs || msRemaining === undefined) {
    return null
  }

  const progress = Math.round((msRemaining / speedRoundMs) * 100)
  const displaySeconds = Math.ceil(msRemaining / 1000)
  const hue = (msRemaining / speedRoundMs) * 120
  const borderColor = `hsl(${hue}, 75%, 45%)`
  const backgroundColor = `hsla(${hue}, 75%, 45%, 0.15)`

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        background: backgroundColor,
        borderRadius: '50%',
        animation: 'pulseTimer 1.5s infinite',
        '@keyframes pulseTimer': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
      }}
    >
      <CircularProgress
        variant="determinate"
        value={progress}
        size={size}
        thickness={6}
        enableTrackSlot
        sx={{
          color: borderColor,
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
            fontWeight: 800,
            fontSize: `${size * 0.4}px`,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            userSelect: 'none',
          }}
        >
          {displaySeconds}
        </Typography>
      </Box>
    </Box>
  )
}

export default SpeedRoundTimer
