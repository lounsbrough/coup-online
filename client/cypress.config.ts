import { defineConfig } from "cypress"
import { GameState } from "../shared/types/game"
import { createGameState, getGameState, mutateGameState } from "../server/src/utilities/gameState"
import { getValue } from "../server/src/utilities/storage"

const setGameStateTask = async (state: GameState) => {
  if (!await getValue(state.roomId)) {
    await createGameState(state.roomId, state)
  }
  await mutateGameState(await getGameState(state.roomId), () => state)
  return null
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        setGameState({ state }: { state: GameState }) {
          return setGameStateTask(state)
        }
      })
      return config
    },
    video: true
  }
})
