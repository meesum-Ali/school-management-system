import eslintConfigNext from 'eslint-config-next'
import prettierPlugin from 'eslint-plugin-prettier'
import tseslintPlugin from '@typescript-eslint/eslint-plugin'

const config = [
  // Ignore only generated/build artifacts – lint all source files by default
  {
    ignores: ['node_modules/**', '.next/**', 'out/**'],
  },
  // Next.js recommended rules (core-web-vitals)
  ...eslintConfigNext,
  // Project customizations
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      prettier: prettierPlugin,
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // Relax a few noisy rules while we incrementally refactor
      'react/display-name': 'off',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default config
