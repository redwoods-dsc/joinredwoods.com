import { test, takeSnapshot } from '@chromatic-com/playwright';
import type { Page } from '@playwright/test';

/**
 * Chromatic refuses any snapshot larger than 25,000,000 pixels, and it captures
 * the full page rather than the viewport. At its 1280px capture width the style
 * guide is 1280 × 21,561 = 27.6M — over. It was at 24,998,400 before the last
 * component landed, so it had been passing with 0.006% to spare; the next
 * section to be added was always going to break it.
 *
 * Widening doesn't help — the page gets shorter but the area grows (1440px is
 * 29.5M, 1600px is 32.7M). So the guide is captured in slices instead, showing
 * a contiguous run of sections at a time. Three keeps each around 9M, which
 * leaves room for the guide to keep growing before this needs revisiting.
 */
const SLICES = 3;

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
async function loadLazyImages(page: Page) {
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

// Slices are produced by hiding the sections a slice doesn't cover, so each
// snapshot is an ordinary full-page capture of a genuinely shorter page. The
// alternative — cropToViewport plus scrolling — relies on scroll position
// surviving into the archive, which isn't something Chromatic documents.
test.use({ disableAutoSnapshot: true });

test.describe('visual regression', () => {
  test('style guide', async ({ page }, testInfo) => {
    await page.goto('/style-guide');
    await page.waitForLoadState('networkidle');
    await loadLazyImages(page);

    const ids = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.section'), (section) => section.id),
    );
    const perSlice = Math.ceil(ids.length / SLICES);

    for (let i = 0; i < SLICES; i += 1) {
      const shown = ids.slice(i * perSlice, (i + 1) * perSlice);
      if (shown.length === 0) continue;

      await page.evaluate((keep) => {
        document.querySelectorAll('.section').forEach((section) => {
          (section as HTMLElement).style.display = keep.includes(section.id) ? '' : 'none';
        });
      }, shown);

      await takeSnapshot(page, `${shown[0]} to ${shown[shown.length - 1]}`, testInfo);
    }
  });
});
