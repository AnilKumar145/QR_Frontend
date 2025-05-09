import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Remove the base path since we're deploying to the root domain on Render
  // base: '/qr-attendance-frontend/',
})


