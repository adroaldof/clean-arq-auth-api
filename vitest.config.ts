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
      '@/ports': path.resolve(__dirname, './src/application/ports'),
      '@/use-cases': path.resolve(__dirname, './src/application/use-cases'),
      '@/entities': path.resolve(__dirname, './src/domain/entities'),
      '@/controller': path.resolve(__dirname, './src/infra/controller'),
      '@/http': path.resolve(__dirname, './src/infra/http'),
      '@/': path.resolve(__dirname, './src'),
    },
  },
})
