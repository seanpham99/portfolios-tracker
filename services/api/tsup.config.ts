import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  target: 'node20',
  sourcemap: true,
  clean: true,
  splitting: false,
  noExternal: [
    '@workspace/api-types',
    '@workspace/database-types'
  ],
});
