const baseConfig = require('../config/eslint/base.js');

module.exports = {
  ...baseConfig,
  parserOptions: {
    ...baseConfig.parserOptions,
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    ...baseConfig.rules,
    // Import resolver hatalarını geçici olarak kapat
    'import/no-unresolved': 'off',
    'import/namespace': 'off',
    'import/order': 'off',
    'import/no-duplicates': 'off',
    'import/default': 'off',
  },
};

