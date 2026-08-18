import { test } from '@chromatic-com/playwright';

test.describe('visual regression', () => {
  test('style guide', async ({ page }) => {
    await page.goto('/style-guide');
    await page.waitForLoadState('networkidle');
  });
});
