import { test, expect } from 'playwright/test';

test('닌자 허브가 열리고 게임 시작 팝업이 생성된다', async ({ page, context }) => {
  // HashRouter를 사용하므로 URL에 해시 경로를 명시합니다.
  await page.goto('/#/ninja-game-hub');
  await expect(page.getByRole('heading', { name: '나루토 닌자 맛 게임 시작 허브' })).toBeVisible();

  // GAME START는 새 창을 여는 동작이므로 팝업 이벤트를 기다려 검증합니다.
  const popupPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'GAME START' }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');

  await expect(popup).toHaveURL(/games\/ninja\/index\.html/);
});
