import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./scripts/test-global-setup.ts'],
    setupFiles: ['./scripts/test-env-setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
