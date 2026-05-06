import { useMemo, ReactNode } from 'react'
import { confirmActionsStorageKey, showBackgroundImageStorageKey } from '../helpers/localStorageKeys'
import { usePersistedState } from '../hooks/usePersistedState'
import { UserSettingsContext } from './UserSettingsContext'

interface UserSettingsContextProviderProps {
  children: ReactNode
}

export function UserSettingsContextProvider({ children }: Readonly<UserSettingsContextProviderProps>) {
  const [showBackgroundImage, setShowBackgroundImage] = usePersistedState<boolean>(showBackgroundImageStorageKey, true)
  const [confirmActions, setConfirmActions] = usePersistedState<boolean>(confirmActionsStorageKey, true)

  const contextValue = useMemo(
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

export default UserSettingsContextProvider
