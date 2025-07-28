import { createContext, useState, useMemo, useRef, useContext, useCallback, ReactNode } from 'react'
import { Alert, AlertColor, Fade } from '@mui/material'
import { useTranslationContext } from './TranslationsContext'

interface Notification {
  id: string;
  message: string | ReactNode;
  severity: AlertColor;
  eternal?: boolean;
  dismissTimeout?: ReturnType<typeof setTimeout>;
  dismissed?: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id' | 'dismissed' | 'dismissTimeout'> & { id?: string }) => void;
  removeNotification: (id: string) => void;
  playChime: () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  showNotification: () => {
    console.warn('showNotification called without a provider')
  },
  removeNotification: () => {
    console.warn('removeNotification called without a provider')
  },
  playChime: () => {
    console.warn('playChime called without a provider')
  },
})

interface NotificationsContextProviderProps {
  children: ReactNode;
}

function playChime(): void {
  const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext

  if (!AudioContext) {
    console.warn('Web Audio API is not supported in this browser.')
    return
  }

  try {
    const audioContext = new AudioContext()
    const now = audioContext.currentTime

    const oscillator1: OscillatorNode = audioContext.createOscillator()
    const gainNode1: GainNode = audioContext.createGain()

    oscillator1.connect(gainNode1)
    gainNode1.connect(audioContext.destination)

    oscillator1.type = 'sine'
    oscillator1.frequency.setValueAtTime(440, now)

    const duration1: number = 0.15

    gainNode1.gain.setValueAtTime(1, now)
    gainNode1.gain.exponentialRampToValueAtTime(0.001, now + duration1)

    oscillator1.start(now)
    oscillator1.stop(now + duration1)

    const oscillator2: OscillatorNode = audioContext.createOscillator()
    const gainNode2: GainNode = audioContext.createGain()

    oscillator2.connect(gainNode2)
    gainNode2.connect(audioContext.destination)

    oscillator2.type = 'sine'
    oscillator2.frequency.setValueAtTime(880, now + duration1 * 0.5)

    const duration2: number = 0.3

    gainNode2.gain.setValueAtTime(1, now + duration1 * 0.5)
    gainNode2.gain.exponentialRampToValueAtTime(0.001, now + duration1 * 0.5 + duration2)

    oscillator2.start(now + duration1 * 0.5)
    oscillator2.stop(now + duration1 * 0.5 + duration2)

    const totalDuration = duration1 + duration2

    setTimeout(() => {
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(error => console.error("Error closing AudioContext:", error))
      }
    }, (totalDuration + 0.1) * 1000)
  } catch (error) {
    console.error("Error playing chime sound:", error)
  }
}

export function NotificationsContextProvider({ children }: NotificationsContextProviderProps) {
  const notificationsContainerRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { t } = useTranslationContext()

  const dismissNotification = useCallback((id: string) => {
    setNotifications((existing) => {
      const index = existing.findIndex((notification) => notification.id === id)

      if (index === -1) {
        return existing
      }

      if (existing[index].dismissTimeout) {
        clearTimeout(existing[index].dismissTimeout)
      }

      const modified = [...existing]
      modified[index] = {
        ...existing[index],
        dismissed: true
      }

      return modified
    })
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((existing) => {
      if (!existing.some(({ id: existingId }) => existingId === id)) {
        return existing
      }

      const remaining = existing.filter((notification) => notification.id !== id)

      if (notificationsContainerRef.current) {
        if (remaining.length) {
          const currentWidth = getComputedStyle(notificationsContainerRef.current).width
          notificationsContainerRef.current.style.minWidth = currentWidth
        } else {
          notificationsContainerRef.current.style.minWidth = 'auto'
        }
      }

      return remaining
    })
  }, [])

  const showNotification = useCallback((notification: Omit<Notification, 'id' | 'dismissed' | 'dismissTimeout'> & { id?: string }) => {
    const newId = notification.id || crypto.randomUUID()

    const newNotification: Notification = {
      ...notification,
      id: newId,
      severity: notification.severity,
      dismissed: false
    }

    if (!notification.eternal) {
      newNotification.dismissTimeout = setTimeout(() => dismissNotification(newId), 5000)
    }

    setNotifications((existing) => {
      const existingIndex = existing.findIndex(({ id }) => id === newId)

      if (existingIndex !== -1) {
        if (existing[existingIndex].dismissTimeout) {
          clearTimeout(existing[existingIndex].dismissTimeout)
        }
        return [
          ...existing.slice(0, existingIndex),
          newNotification,
          ...existing.slice(existingIndex + 1)
        ]
      } else {
        return [...existing, newNotification]
      }
    })
  }, [dismissNotification])

  const contextValue = useMemo<NotificationsContextType>(
    () => ({ notifications, showNotification, removeNotification, playChime }),
    [notifications, showNotification, removeNotification, playChime]
  )

  return (
    <NotificationsContext.Provider value={contextValue}>
      {!!notifications.length && (
        <div
          ref={notificationsContainerRef}
          style={{
            position: 'fixed',
            top: '3.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '1301',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {notifications.map(({ id, severity, message, dismissed }) => (
            <Fade
              key={id}
              in={!dismissed}
              onExited={() => removeNotification(id)}
              timeout={{ enter: 300, exit: 500 }}
            >
              <Alert
                onClose={() => dismissNotification(id)}
                severity={severity}
                sx={{ marginTop: 1, minWidth: '300px' }}
              >
                <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                  {`${t(severity)}: `}
                </span>
                {message}
              </Alert>
            </Fade>
          ))}
        </div>
      )}
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsContextProvider')
  }
  return context
}
