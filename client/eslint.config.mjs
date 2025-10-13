import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

export default [
  { files: ["**/*.{js,jsx,ts,tsx}"] },
  { ignores: ["build/*"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      semi: ['error', 'never']
    }
  },
  {
    files: ['**/translations.ts', '**/SnarkyDeadComment.tsx'],
    rules: { 'sort-keys': ['error', 'asc'] }
  }
]
