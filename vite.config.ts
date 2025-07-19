import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  },
  build: {
    outDir: 'dist-ui',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        desktop: path.resolve(__dirname, 'desktop.html')
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  },
  base: './',
  define: {
    global: 'globalThis'
  }
})
