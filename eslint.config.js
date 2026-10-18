import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Each context module deliberately exports its Provider together with the
    // hook that reads it — the standard React pattern, and what every consumer
    // imports. Splitting those hooks into separate files to satisfy Fast
    // Refresh would mean rewriting imports across ~43 files (useLang alone has
    // 30 consumers) for a dev-only gain: editing one of these five files does a
    // full reload instead of a hot swap. Accepted deliberately.
    files: [
      'src/context/*.jsx',
      'src/components/SmoothScrollProvider.jsx',
    ],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
