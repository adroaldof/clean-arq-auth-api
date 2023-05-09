import path from 'path'
import { defineConfig } from 'vitest/config'
/// <reference types="vitest" />
/// <reference types="vite/client" />

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    coverage: {
      reporter: ['text', 'text-summary', 'html'],
      skipFull: true,
    },
  },
  resolve: {
    alias: {
      '@/controller': path.resolve(__dirname, './src/infra/controller'),
      '@/http': path.resolve(__dirname, './src/infra/http'),
      '@/': path.resolve(__dirname, './src'),
    },
  },
})
