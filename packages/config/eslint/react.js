/** @type {import('eslint').Linter.Config} */
const baseConfig = require('./base.js');

module.exports = {
  ...baseConfig,
  extends: [
    ...(Array.isArray(baseConfig.extends) ? baseConfig.extends : [baseConfig.extends].filter(Boolean)),
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  plugins: [...(baseConfig.plugins || []), 'react', 'react-hooks'],
  parserOptions: {
    ...baseConfig.parserOptions,
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    ...baseConfig.env,
    browser: true,
  },
  settings: {
    ...baseConfig.settings,
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...baseConfig.rules,
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};

