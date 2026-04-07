import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // MySQL 게임 API (backend/server.js 기본 5000)
      '/api/wallet': { target: 'http://localhost:5000', changeOrigin: true },
      '/api/items': { target: 'http://localhost:5000', changeOrigin: true },
      '/api/inventory': { target: 'http://localhost:5000', changeOrigin: true },
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
})
