import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ทำให้ Vite สามารถฟังที่ 0.0.0.0 ซึ่งรองรับการเข้าถึงจากภายนอก
    port: 4173,        // กำหนดพอร์ตที่ต้องการใช้
  },
})
