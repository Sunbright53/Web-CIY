import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: '/',                    // ✅ ใช้ custom domain ต้องเป็น '/'
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'docs',             // ✅ ให้ Pages เสิร์ฟจาก /docs ตามที่ตั้งไว้
    sourcemap: false,
  },
})
