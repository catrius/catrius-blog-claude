import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import importX from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint, { parser as tsParser } from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'api']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      betterTailwindcss.configs.recommended,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/index.css',
      },
      'import-x/resolver': {
        typescript: true,
      },
    },
  },
]);
