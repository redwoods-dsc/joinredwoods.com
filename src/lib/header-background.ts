import { getImage } from 'astro:assets';
import trees from '../assets/trees-01.png';

/**
 * The header trees are the LCP element on every page. Two things follow from
 * that, and both need the same resolved URL — hence a shared helper rather
 * than a getImage() call sitting inside Header.astro:
 *
 * 1. The source PNG is 697 KiB. WebP keeps the alpha channel and lands around
 *    270 KiB, so we run it through the image pipeline rather than shipping the
 *    original. Size stays at the intrinsic 587x960 the CSS paints it at.
 * 2. A CSS background is invisible to the browser's preload scanner, so
 *    Layout.astro preloads this URL from <head> to get the request started
 *    alongside the stylesheet instead of after it.
 *
 * Called (and awaited) from component frontmatter, not resolved at module
 * scope: the image service only exists during a render pass. Repeat calls with
 * these arguments resolve to the same generated file.
 */
export function headerBackground() {
  return getImage({ src: trees, format: 'webp', quality: 80 });
}
