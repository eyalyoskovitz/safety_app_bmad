import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detect deployment environment
// - GitHub Pages: needs /safety_app_bmad/ base path and outputs to ../docs
// - Vercel/Netlify: uses root path (/) and outputs to dist
const isGitHubPages = process.env.GITHUB_PAGES === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? '/safety_app_bmad/' : '/',
  build: {
    outDir: isGitHubPages ? '../docs' : 'dist',
    emptyOutDir: true,
  },
})
