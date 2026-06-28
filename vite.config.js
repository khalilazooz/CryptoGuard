import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built app works when opened from any sub-path
// (e.g. served inside the wallet app tree, not just the domain root).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5180, open: true },
})
