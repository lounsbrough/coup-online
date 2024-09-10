import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

export default [
  { files: ["**/*.{js,jsx,ts,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      semi: ['error', 'never']
    }
  }
]
