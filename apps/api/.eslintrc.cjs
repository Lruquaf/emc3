const baseConfig = require('../../packages/config/eslint/base.js');

module.exports = {
  ...baseConfig,
  parserOptions: {
    ...baseConfig.parserOptions,
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    ...baseConfig.rules,
    'no-console': 'off', // API'de console.log kullanabiliriz
  },
};

