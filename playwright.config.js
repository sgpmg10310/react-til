import { defineConfig } from 'playwright/test';

export default defineConfig({
  // Playwright 대상 테스트를 별도 디렉터리로 고정해 기존 로직 테스트와 충돌을 방지합니다.
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
