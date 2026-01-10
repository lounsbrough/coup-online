import { createContext, useMemo, useContext, ReactNode } from 'react'
import { confirmActionsStorageKey, showBackgroundImageStorageKey } from '../helpers/localStorageKeys'
import { usePersistedState } from '../hooks/usePersistedState';

interface UserSettingsContextType {
  showBackgroundImage: boolean;
  confirmActions: boolean;
  setShowBackgroundImage: (value: boolean) => void;
  setConfirmActions: (value: boolean) => void;
}

const UserSettingsContext = createContext<UserSettingsContextType>({
  showBackgroundImage: true,
  confirmActions: true,
  setShowBackgroundImage: () => {
    console.warn('setShowBackgroundImage called without a provider')
  },
  setConfirmActions: () => {
    console.warn('setConfirmActions called without a provider')
  },
})

interface UserSettingsContextProviderProps {
  children: ReactNode;
}

export function UserSettingsContextProvider({ children }: Readonly<UserSettingsContextProviderProps>) {
  const [showBackgroundImage, setShowBackgroundImage] = usePersistedState<boolean>(showBackgroundImageStorageKey, true)
  const [confirmActions, setConfirmActions] = usePersistedState<boolean>(confirmActionsStorageKey, true)

  const contextValue = useMemo<UserSettingsContextType>(
    () => ({
      showBackgroundImage,
      confirmActions,
      setShowBackgroundImage,
      setConfirmActions
    }),
    [showBackgroundImage, confirmActions, setShowBackgroundImage, setConfirmActions]
  )

  return (
    <UserSettingsContext.Provider value={contextValue}>
      {children}
    </UserSettingsContext.Provider>
  )
}

export const useUserSettingsContext = () => {
  const context = useContext(UserSettingsContext)
  if (context === undefined) {
    throw new Error('useUserSettingsContext must be used within a UserSettingsContextProvider')
  }
  return context
}
