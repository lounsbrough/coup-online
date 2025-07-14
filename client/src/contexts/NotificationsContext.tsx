import { createContext, useState, useMemo, useRef, useContext, useCallback, ReactNode } from 'react'
import { Alert, Fade } from '@mui/material'
import { AlertColor } from '@mui/material/Alert'

interface Notification {
  id: string;
  message: string | ReactNode;
  severity: 'success' | 'error' | 'warning' | 'info';
  eternal?: boolean;
  dismissTimeout?: ReturnType<typeof setTimeout>;
  dismissed?: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id' | 'dismissed' | 'dismissTimeout'> & { id?: string }) => void;
  removeNotification: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  showNotification: () => {
    console.warn('showNotification called without a provider')
  },
  removeNotification: () => {
    console.warn('removeNotification called without a provider')
  }
})

interface NotificationsContextProviderProps {
  children: ReactNode;
}

export function NotificationsContextProvider({ children }: NotificationsContextProviderProps) {
  const notificationsContainerRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

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
    () => ({ notifications, showNotification, removeNotification }),
    [notifications, showNotification, removeNotification]
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
                severity={severity.toLowerCase() as AlertColor}
                sx={{ marginTop: 1, minWidth: '300px' }}
              >
                <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                  {`${severity.toLowerCase()}: `}
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
