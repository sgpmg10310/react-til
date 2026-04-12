import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src',
  test: {
    environment: 'node',
    include: ['**/*.test.{js,jsx}'],
    passWithNoTests: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: '../dist', // 빌드 결과물을 src/dist가 아닌 프로젝트 최상위 dist 폴더에 생성
    emptyOutDir: true, // 빌드하기 전에 기존 dist 폴더를 깨끗하게 비움
  },
  server: {
    port: 5173, // 사용할 포트를 명시적으로 지정합니다.
  },
  base: '/react-til/', // GitHub Pages 저장소 이름으로 기본 경로 설정
})