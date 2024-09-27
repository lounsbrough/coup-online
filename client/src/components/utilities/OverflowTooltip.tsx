import { Box, SxProps, Tooltip } from '@mui/material'
import { useRef, useEffect, useState } from 'react'

function OverflowTooltip({ children, sx }: { children: string, sx?: SxProps }) {

  const textElementRef = useRef<HTMLInputElement | null>(null)

  const compareSize = () => {
    const compare =
      (textElementRef.current?.scrollWidth ?? 0) > (textElementRef.current?.clientWidth ?? 0)
    setHover(compare)
  }

  useEffect(() => {
    compareSize()
    window.addEventListener('resize', compareSize)
  }, [])

  useEffect(() => () => {
    window.removeEventListener('resize', compareSize)
  }, [])

  const [hoverStatus, setHover] = useState(false)

  return (
    <Tooltip
      title={children}
      disableHoverListener={!hoverStatus}
    >
      <Box
        ref={textElementRef}
        sx={{
          ...sx,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {children}
      </Box>
    </Tooltip>
  )
}

export default OverflowTooltip
