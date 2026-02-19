import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    commonjsOptions: {
      include: [/shared/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-emoji': ['emoji-picker-react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@shared'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
