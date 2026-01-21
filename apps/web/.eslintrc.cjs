const reactConfig = require('../../packages/config/eslint/react.js');

module.exports = {
  ...reactConfig,
  parserOptions: {
    ...reactConfig.parserOptions,
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};

