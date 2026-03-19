import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://s-production-2907.up.railway.app',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
