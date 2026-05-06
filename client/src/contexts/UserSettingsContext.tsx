import { createContext, useContext } from 'react'

interface UserSettingsContextType {
  showBackgroundImage: boolean
  confirmActions: boolean
  setShowBackgroundImage: (value: boolean) => void
  setConfirmActions: (value: boolean) => void
}

export const UserSettingsContext = createContext<UserSettingsContextType>({
  showBackgroundImage: true,
  confirmActions: true,
  setShowBackgroundImage: () => {
    console.warn('setShowBackgroundImage called without a provider')
  },
  setConfirmActions: () => {
    console.warn('setConfirmActions called without a provider')
  },
})

export const useUserSettingsContext = () => {
  const context = useContext(UserSettingsContext)
  if (context === undefined) {
    throw new Error('useUserSettingsContext must be used within a UserSettingsContextProvider')
  }
  return context
}
