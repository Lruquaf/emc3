const baseConfig = require('../../packages/config/eslint/base.js');

module.exports = {
  ...baseConfig,
  parserOptions: {
    ...baseConfig.parserOptions,
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  settings: {
    ...baseConfig.settings,
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
  rules: {
    ...baseConfig.rules,
    'no-console': 'off', // API'de console.log kullanabiliriz
    // Import resolver hatalarını geçici olarak warning'e düşür
    'import/no-unresolved': ['warn', { 
      ignore: ['^cloudinary'],
      caseSensitive: false,
    }],
    'import/namespace': 'warn',
    'import/order': 'warn',
    'import/no-duplicates': 'warn',
  },
};

