import { defineConfig } from 'cypress'
import { DehydratedGameState, GameState } from '../shared/types/game'
import {
  createGameState,
  getGameState,
  mutateGameState,
} from '../server/src/utilities/gameState'
import { getValue } from '../server/src/utilities/storage'
import { rehydrateGameState } from '../shared/helpers/state'

const setGameStateTask = async (state: GameState) => {
  if (!(await getValue(state.roomId))) {
    await createGameState(state.roomId, state)
  }
  await mutateGameState(await getGameState(state.roomId), () => {})
  return null
}

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        setGameState({ state }: { state: DehydratedGameState }) {
          return setGameStateTask(rehydrateGameState(state))
        },
      })
      return config
    },
    video: true,
  },
})
