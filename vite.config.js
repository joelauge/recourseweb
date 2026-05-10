// Final build with correct Stripe PK mapping
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/v1': {
        target: 'http://127.0.0.1:3003',
        changeOrigin: true,
      },
      '/search': {
        target: 'http://127.0.0.1:3003',
        changeOrigin: true,
      },
      '/events': {
        target: 'http://127.0.0.1:3003',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
