import { useState, ReactNode } from 'react'
import { GameSettingsContext } from './GameSettingsContext'

function GameSettingsContextProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [useInquisitor, setUseInquisitor] = useState(false)

  return (
    <GameSettingsContext.Provider value={{ useInquisitor, setUseInquisitor }}>
      {children}
    </GameSettingsContext.Provider>
  )
}

export default GameSettingsContextProvider
