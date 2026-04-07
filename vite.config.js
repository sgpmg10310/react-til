import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 사용할 포트를 명시적으로 지정합니다.
  },
  base: '/react-til/', // GitHub Pages 저장소 이름으로 기본 경로 설정
})