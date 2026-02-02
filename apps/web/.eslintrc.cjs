const reactConfig = require('../../packages/config/eslint/react.js');
const path = require('path');

module.exports = {
  ...reactConfig,
  parserOptions: {
    ...reactConfig.parserOptions,
    project: path.resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
  },
  settings: {
    ...reactConfig.settings,
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: path.resolve(__dirname, './tsconfig.json'),
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
  rules: {
    ...reactConfig.rules,
    // Import resolver sorunlarını kapat - TypeScript compiler zaten kontrol ediyor
    'import/no-unresolved': 'off',
    'import/namespace': 'off',
  },
};

