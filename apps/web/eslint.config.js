import { defineConfig } from 'eslint/config';
import sharedReactConfig from '@repo/eslint-config/react';
import reactRefresh from 'eslint-plugin-react-refresh';

export default defineConfig([
  {
    ignores: ['dist', '.react-router', 'node_modules'],
  },
  
  // Extend shared react configuration
  ...sharedReactConfig,
  
  // App-specific overrides
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]);
