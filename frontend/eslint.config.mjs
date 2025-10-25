import eslintConfigNext from 'eslint-config-next'
import prettierPlugin from 'eslint-plugin-prettier'
import tseslintPlugin from '@typescript-eslint/eslint-plugin'

const config = [
  {
    ignores: [
      '**/*.spec.tsx',
      '**/*.spec.ts',
      'pages/**',
      'components/**',
      'lib/**',
      'src/**',
    ],
  },
  ...eslintConfigNext,
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
    },
  },
]

export default config
