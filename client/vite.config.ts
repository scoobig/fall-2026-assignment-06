import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const proxy = {
  '/articles': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
  '/health': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy,
  },
  preview: {
    port: 4173,
    proxy,
  },
})
