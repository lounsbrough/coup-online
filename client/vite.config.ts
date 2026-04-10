import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const appVersion = process.env.VITE_APP_VERSION || '0.0.0'

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
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
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) {
            return 'vendor-react'
          }
          if (id.includes('@mui/material') || id.includes('@mui/icons-material')) {
            return 'vendor-mui'
          }
          if (id.includes('emoji-picker-react')) {
            return 'vendor-emoji'
          }
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
