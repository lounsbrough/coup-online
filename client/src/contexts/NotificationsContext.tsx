import { createContext, useState, useMemo, useRef, useContext, useCallback } from 'react'
import { Alert, Fade } from '@mui/material'

export enum NOTIFICATION_TYPES {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS'
};

const NotificationsContext = createContext({
  notifications: [],
  showNotification: null,
  removeNotification: null
})

export function NotificationsContextProvider({ children }) {
  const notificationsContainerRef = useRef(null)
  const [notifications, setNotifications] = useState([])

  const dismissNotification = (id) => {
    setNotifications((existing) => {
      const index = existing.findIndex((notification) => notification.id === id)

      if (index === -1) {
        return existing
      }

      clearTimeout(existing[index].dismissTimeout)

      const modified = [...existing]

      modified[index] = {
        ...existing[index],
        dismissed: true
      }

      return modified
    })
  }

  const removeNotification = useCallback((id) => {
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

  const showNotification = useCallback((notification) => {
    const newId = notification.id || crypto.randomUUID()

    const newNotification = {
      ...notification,
      id: newId,
      severity: notification.severity ?? NOTIFICATION_TYPES.ERROR
    }

    if (!notification.eternal) {
      newNotification.dismissTimeout = setTimeout(() => dismissNotification(newId), 15000)
    }

    setNotifications((existing) => {
      if (existing.some(({ id }) => id === notification.id)) {
        return existing
      }

      const previousIndex = existing.findIndex(({ id }) => id === newId)

      if (previousIndex === -1) {
        return [...existing, newNotification]
      }

      clearTimeout(existing[previousIndex].dismissTimeout)

      return [
        ...existing.slice(0, previousIndex),
        newNotification,
        ...existing.slice(previousIndex + 1)
      ]
    })
  }, [])

  const contextValue = useMemo(
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
            zIndex: '1301'
          }}
        >
          {notifications.map(({
            id, severity, message, dismissed
          }) => (
            <Fade
              key={id}
              in={!dismissed}
              onExited={() => removeNotification(id)}
            >
              <Alert
                onClose={() => dismissNotification(id)}
                severity={severity.toLowerCase()}
                sx={{ marginTop: 1 }}
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

export const useNotificationsContext = () => useContext(NotificationsContext)
