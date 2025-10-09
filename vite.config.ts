// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/', // ❗️เหลืออันเดียวพอ (ถ้า deploy GitHub Pages ใต้ชื่อ repo ให้เปลี่ยนเป็น '/ciy-student-reports/')
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'docs',
    sourcemap: false,
  },
});
