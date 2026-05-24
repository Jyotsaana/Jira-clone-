import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactRefresh.configs.vite.rules,
      'react-refresh/only-export-components': 'off',
    },
  },
]
