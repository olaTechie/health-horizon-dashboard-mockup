import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: true,
    css: false,
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
