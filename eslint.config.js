// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier'; // Import eslint-config-prettier

export default [
  { ignores: ['dist'] }, // Keep ignoring the dist folder
  {
    // Configuration for JS/JSX files
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest', // Use 'latest' consistently
      sourceType: 'module',
      globals: {
        ...globals.browser, // Use browser globals
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }, // Enable JSX parsing
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Start with recommended rules
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Your custom rules
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }], // Changed to 'warn' during dev is often helpful
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Add other rules as needed
    },
  },
  // Add Prettier config LAST - this disables ESLint rules that conflict with Prettier
  eslintConfigPrettier,
];
