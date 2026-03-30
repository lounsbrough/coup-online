import path from 'path'
import { defineConfig } from 'cypress'
import { build } from 'vite'
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
  await mutateGameState(await getGameState(state.roomId), () => { })
  return null
}

function vitePreprocessor(): Cypress.FileProcessorFunction {
  return async (file) => {
    const { outputPath, filePath } = file
    const fileName = path.basename(outputPath)
    const filenameWithoutExtension = path.basename(outputPath, path.extname(outputPath))

    await build({
      configFile: false,
      logLevel: 'warn',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
      build: {
        emptyOutDir: false,
        minify: false,
        outDir: path.dirname(outputPath),
        sourcemap: true,
        write: true,
        lib: {
          entry: filePath,
          fileName: () => fileName,
          formats: ['umd'],
          name: filenameWithoutExtension,
        },
      },
    })

    return outputPath
  }
}

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('file:preprocessor', vitePreprocessor())
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
