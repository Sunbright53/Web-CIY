import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ciy-student-reports/', // สำหรับ GitHub Pages
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // ✅ ใช้ fileURLToPath แทน path.resolve
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
