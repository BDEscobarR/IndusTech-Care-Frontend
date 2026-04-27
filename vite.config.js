import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy /api requests to Spring Boot — evita problemas de CORS en desarrollo
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})