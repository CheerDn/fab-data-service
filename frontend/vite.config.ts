import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'

export default defineConfig({
  plugins: [react(), reactClickToComponent()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
