import { getImage } from 'astro:assets';
import trees from '../assets/trees-04.png';

/**
 * The header trees are the LCP element on every page. Three things follow from
 * that, and the first two need the same resolved URL — hence a shared helper
 * rather than a getImage() call sitting inside Header.astro:
 *
 * 1. PNG, not WebP, because the artwork arrives already sitting on the accent
 *    and a lossy encode can't hold a flat colour: WebP goes through YUV and
 *    hands back a surround 1-2 levels off --color-accent, which reads as a
 *    hairline where the image meets the card. PNG is lossless, and quantised
 *    (astro.config.mjs sets that up) it costs 83 KiB against a lossy WebP's
 *    75, which measured as no Lighthouse difference at all.
 * 2. A CSS background is invisible to the browser's preload scanner, so
 *    Layout.astro preloads this URL from <head> to get the request started
 *    alongside the stylesheet instead of after it.
 * 3. The flat area is only invisible while it matches the card underneath, so
 *    `.header` must keep painting `background-color: var(--color-accent)` and
 *    the artwork must keep being drawn on that same colour. Re-theming the
 *    accent means re-cutting the artwork.
 *
 * Called (and awaited) from component frontmatter, not resolved at module
 * scope: the image service only exists during a render pass. Repeat calls with
 * these arguments resolve to the same generated file.
 */
export function headerBackground() {
  return getImage({ src: trees, format: 'png' });
}
