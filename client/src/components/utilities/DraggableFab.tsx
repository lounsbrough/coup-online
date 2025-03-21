import { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react'
import Fab from '@mui/material/Fab'
import ChatIcon from '@mui/icons-material/Chat'

interface Position {
  x: number;
  y: number;
}

interface Offset {
  x: number;
  y: number;
}

function DraggableFab() {
  const fabRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<Position>(() => {
    const storedPosition = localStorage.getItem('coupChatBubblePosition')
    return storedPosition ? JSON.parse(storedPosition) : { x: 0, y: 0 }
  })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })

  useEffect(() => {
    localStorage.setItem('coupChatBubblePosition', JSON.stringify(position))
  }, [position])

  const handleStart = (event: MouseEvent | TouchEvent) => {
    let clientX: number, clientY: number

    if ('touches' in event && event.touches) {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    } else {
      clientX = (event as MouseEvent).clientX
      clientY = (event as MouseEvent).clientY
    }

    setIsDragging(true)
    setOffset({
      x: clientX - position.x,
      y: clientY - position.y,
    })
  }

  const handleMove = (event: MouseEvent | TouchEvent) => {
    if (isDragging && fabRef.current) {
      let clientX: number, clientY: number

      if ('touches' in event && event.touches) {
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      } else {
        clientX = (event as MouseEvent).clientX
        clientY = (event as MouseEvent).clientY
      }

      const newX = clientX - offset.x
      const newY = clientY - offset.y

      const fabWidth = fabRef.current.offsetWidth
      const fabHeight = fabRef.current.offsetHeight

      const maxX = window.innerWidth - fabWidth
      const maxY = window.innerHeight - fabHeight

      const clampedX = Math.max(0, Math.min(newX, maxX))
      const clampedY = Math.max(0, Math.min(newY, maxY))

      setPosition({ x: clampedX, y: clampedY })
    }
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent | Event) => {
      handleMove(event as MouseEvent)
    }

    const handleTouchMove = (event: TouchEvent | Event) => {
      handleMove(event as TouchEvent)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })

      const removeListeners = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('touchmove', handleTouchMove)
      }

      document.addEventListener('mouseup', () => {
        handleEnd()
        removeListeners()
      }, { once: true })

      document.addEventListener('touchend', () => {
        handleEnd()
        removeListeners()
      }, { once: true })

      document.addEventListener('mouseleave', () => {
        handleEnd()
        removeListeners()
      }, { once: true })

      document.addEventListener('touchcancel', () => {
        handleEnd()
        removeListeners()
      }, { once: true })
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isDragging])

  useEffect(() => {
    const handleResize = () => {
      if (fabRef.current) {
        const fabWidth = fabRef.current.offsetWidth
        const fabHeight = fabRef.current.offsetHeight

        const maxX = window.innerWidth - fabWidth
        const maxY = window.innerHeight - fabHeight

        setPosition((prevPosition) => ({
          x: Math.min(prevPosition.x, maxX),
          y: Math.min(prevPosition.y, maxY),
        }))
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <Fab
      ref={fabRef}
      color="primary"
      aria-label="navigation"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x
      }}
    >
      <ChatIcon />
    </Fab>
  )
}

export default DraggableFab
