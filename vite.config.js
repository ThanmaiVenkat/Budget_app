import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// BASE_PATH lets the same build serve from a domain root (Netlify, a plain
// static host) or from a repository subpath (GitHub Pages sets it to
// "/Budget_app/"). Every asset reference in index.html and the service worker
// is relative, so the default of "/" works everywhere else.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss()
  ],
})
