import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'tiktok-backoffice/src') },
  },
  test: {
    include: ['packages/*/test/**/*.test.ts', 'tiktok-*/src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: [
        'packages/auth/src/**/*.ts',
        'packages/server/src/http/**/*.ts',
        'packages/server/src/edge.ts',
        'tiktok-backoffice/src/server/**/*.ts',
      ],
      exclude: ['**/*.test.ts', '**/index.ts', '**/ports/**', '**/r2-storage.ts'],
    },
  },
});
