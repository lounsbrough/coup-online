import { createContext, useState, useMemo, useContext, ReactNode } from 'react'
import { confirmActionsStorageKey, showChickensStorageKey } from '../helpers/localStorageKeys'

interface UserSettingsContextType {
  showChickens: boolean;
  confirmActions: boolean;
  setShowChickens: (value: boolean) => void;
  setConfirmActions: (value: boolean) => void;
}

const UserSettingsContext = createContext<UserSettingsContextType>({
  showChickens: true,
  confirmActions: true,
  setShowChickens: () => {
    console.warn('setShowChickens called without a provider')
  },
  setConfirmActions: () => {
    console.warn('setConfirmActions called without a provider')
  },
})

interface UserSettingsContextProviderProps {
  children: ReactNode;
}

export function UserSettingsContextProvider({ children }: UserSettingsContextProviderProps) {
  const [showChickens, setShowChickens] = useState<boolean>(JSON.parse(localStorage.getItem(showChickensStorageKey) ?? JSON.stringify(true)))
  const [confirmActions, setConfirmActions] = useState<boolean>(JSON.parse(localStorage.getItem(confirmActionsStorageKey) ?? JSON.stringify(true)))

  const setShowChickensHandler = (value: boolean) => {
    setShowChickens(value)
    localStorage.setItem(showChickensStorageKey, JSON.stringify(value))
  }

  const setConfirmActionsHandler = (value: boolean) => {
    setConfirmActions(value)
    localStorage.setItem(confirmActionsStorageKey, JSON.stringify(value))
  }

  const contextValue = useMemo<UserSettingsContextType>(
    () => ({
      showChickens,
      confirmActions,
      setShowChickens: setShowChickensHandler,
      setConfirmActions: setConfirmActionsHandler
    }),
    [showChickens, confirmActions, setShowChickensHandler, setConfirmActionsHandler]
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
