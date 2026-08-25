import { test } from '@chromatic-com/playwright';

/**
 * Walk the page so every lazy image becomes a real request.
 *
 * Astro's <Image> emits loading="lazy", and a headless run never scrolls, so
 * anything below the fold is never fetched. Chromatic archives what the browser
 * actually requested — an image it never saw keeps its original absolute URL in
 * the snapshot, pointing at the preview server that stopped existing when the
 * test run ended. On replay those URLs are unreachable and the story fails to
 * render, which surfaces as "Component error" with nothing else to go on.
 */
async function loadLazyImages(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete));
  await page.waitForLoadState('networkidle');
}

test.describe('visual regression', () => {
  test('style guide', async ({ page }) => {
    await page.goto('/style-guide');
    await page.waitForLoadState('networkidle');
    await loadLazyImages(page);
  });
});
