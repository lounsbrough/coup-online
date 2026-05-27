import { createContext, useContext } from 'react'

type GameSettingsContextType = {
  useInquisitor: boolean
  setUseInquisitor: (value: boolean) => void
}

export const GameSettingsContext = createContext<GameSettingsContextType>({
  useInquisitor: false,
  setUseInquisitor: () => { },
})

export const useGameSettingsContext = () => useContext(GameSettingsContext)
