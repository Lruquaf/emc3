/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  env: {
    node: true,
    es2022: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        // project path will be set in individual project configs
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Import - TypeScript compiler zaten bu kontrolleri yapıyor, resolver sorunlarını önlemek için kapatıyoruz
    'import/no-unresolved': 'off', // TypeScript compiler zaten kontrol ediyor
    'import/namespace': 'off', // TypeScript resolver ile sorunlu
    'import/order': 'off', // Prettier import sorting kullanılıyor veya manuel kontrol
    'import/no-duplicates': 'warn',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.config.js',
    '*.config.ts',
  ],
};

