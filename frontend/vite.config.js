import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Avoid Windows/OneDrive EPERM issues with cache under node_modules/.vite
  cacheDir: process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'hrms-lite-vite-cache')
    : '.vite-cache',
})
