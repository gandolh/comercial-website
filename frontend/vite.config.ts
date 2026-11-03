import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Served at /piataro/ in the deploy (PIATARO_BASE=/piataro/), at / in dev.
const base = process.env.PIATARO_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@app': path.resolve(__dirname, './src/app'),
    },
  },
})
