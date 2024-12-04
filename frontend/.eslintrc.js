module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  rules: {
    // Customize your rules
    'react/prop-types': 'off', // Since you are using TypeScript
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off',
  },
}
