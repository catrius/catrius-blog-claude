import js from '@eslint/js'
import globals from 'globals'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint, { parser as tsParser } from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      betterTailwindcss.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/index.css',
      },
    },
  },
])
