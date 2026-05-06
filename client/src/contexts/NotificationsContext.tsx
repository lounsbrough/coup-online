import { createContext, useContext, ReactNode } from 'react'
import { AlertColor } from '@mui/material'

export interface Notification {
  id: string;
  message: string | ReactNode;
  severity: AlertColor;
  eternal?: boolean;
  action?: { label: ReactNode; icon?: ReactNode; onClick: () => void };
  onDismiss?: () => void;
  dismissTimeout?: ReturnType<typeof setTimeout>;
  dismissed?: boolean;
}

export interface NotificationsContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id' | 'dismissed' | 'dismissTimeout'> & { id?: string }) => void;
  removeNotification: (id: string) => void;
  playChime: () => void;
}

export const NotificationsContext = createContext<NotificationsContextType>({
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

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsContextProvider')
  }
  return context
}
