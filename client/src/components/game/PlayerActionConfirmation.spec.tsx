import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render as testingLibraryRender, act } from '@testing-library/react'
import { PlayerActions } from '@shared'
import { UserSettingsContext } from '../../contexts/UserSettingsContext'
import { TranslationContext } from '../../contexts/TranslationsContext'
import { GameStateContext } from '../../contexts/GameStateContext'
import MaterialThemeContextProvider from '../../contexts/MaterialThemeContextProvider'
import { getRandomGameState } from '../../../tests/utilities/render'
import PlayerActionConfirmation from './PlayerActionConfirmation'

const trigger = vi.fn()

vi.mock('../../hooks/useGameMutation', () => ({
  default: () => ({
    trigger,
    isMutating: false,
  }),
}))

describe('PlayerActionConfirmation', () => {
  beforeEach(() => {
    trigger.mockClear()
  })

  it('auto-submits only once when confirmActions is off even if variables identity changes', () => {
    const gameState = getRandomGameState()
    const onCancel = vi.fn()

    const { rerender } = testingLibraryRender(
      <MaterialThemeContextProvider>
        <GameStateContext.Provider value={{
          gameState,
          setDehydratedGameState: () => { },
          hasInitialStateLoaded: true,
          serverTimeOffset: 0,
        }}>
          <TranslationContext.Provider value={{
            t: (key) => key,
            language: 'en-US' as never,
            setLanguage: () => { },
          }}>
            <UserSettingsContext.Provider value={{
              showBackgroundImage: true,
              confirmActions: false,
              setShowBackgroundImage: () => { },
              setConfirmActions: () => { },
            }}>
              <PlayerActionConfirmation
                message="confirm"
                action={PlayerActions.action}
                variables={{ roomId: gameState.roomId, playerId: 'p1', action: 'Tax' }}
                onCancel={onCancel}
              />
            </UserSettingsContext.Provider>
          </TranslationContext.Provider>
        </GameStateContext.Provider>
      </MaterialThemeContextProvider>
    )

    expect(trigger).toHaveBeenCalledTimes(1)

    act(() => {
      rerender(
        <MaterialThemeContextProvider>
          <GameStateContext.Provider value={{
            gameState,
            setDehydratedGameState: () => { },
            hasInitialStateLoaded: true,
            serverTimeOffset: 0,
          }}>
            <TranslationContext.Provider value={{
              t: (key) => key,
              language: 'en-US' as never,
              setLanguage: () => { },
            }}>
              <UserSettingsContext.Provider value={{
                showBackgroundImage: true,
                confirmActions: false,
                setShowBackgroundImage: () => { },
                setConfirmActions: () => { },
              }}>
                <PlayerActionConfirmation
                  message="confirm"
                  action={PlayerActions.action}
                  variables={{ roomId: gameState.roomId, playerId: 'p1', action: 'Tax' }}
                  onCancel={onCancel}
                />
              </UserSettingsContext.Provider>
            </TranslationContext.Provider>
          </GameStateContext.Provider>
        </MaterialThemeContextProvider>
      )
    })

    expect(trigger).toHaveBeenCalledTimes(1)
  })
})
