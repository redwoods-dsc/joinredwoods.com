import { test } from '@chromatic-com/playwright';

test.describe('visual regression', () => {
  test('style guide', async ({ page }) => {
    await page.goto('/style-guide');
    await page.waitForLoadState('networkidle');
  });

  test('hello world article', async ({ page }) => {
    await page.goto('/blog/hello-world');
    await page.waitForLoadState('networkidle');
  });
});
