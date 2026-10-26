import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Adresse du backend en développement (ex. BACKEND_URL=http://localhost:8095 npm run dev)
const backend = process.env.BACKEND_URL || 'http://localhost:8080'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': backend,
      '/uploads': backend,
    },
  },
})
