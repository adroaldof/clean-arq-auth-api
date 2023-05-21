import path from 'path'
import { defineConfig } from 'vitest/config'
/// <reference types="vitest" />
/// <reference types="vite/client" />

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  test: {
    deps: {
      fallbackCJS: true,
    },
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
      '@/controllers': path.resolve(__dirname, './src/infra/controllers'),
      '@/database': path.resolve(__dirname, './src/infra/database'),
      '@/http': path.resolve(__dirname, './src/infra/http'),
      '@/repositories': path.resolve(__dirname, './src/infra/repositories'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/': path.resolve(__dirname, './src'),
    },
  },
})
