import { getImage } from 'astro:assets';
import trees from '../assets/trees-01.png';
import { colorToken } from './tokens';

/**
 * The header trees are the LCP element on every page. Three things follow from
 * that, and the first two need the same resolved URL — hence a shared helper
 * rather than a getImage() call sitting inside Header.astro:
 *
 * 1. The source PNG is 697 KiB. It's an odd file: R = G = B in every pixel and
 *    only 0.1% of it is fully opaque, so it isn't really a picture of trees —
 *    it's a near-black wash whose entire detail lives in the alpha channel.
 *    That's the expensive way to store it, because alpha becomes a second
 *    full-detail plane that WebP can't compress well (it bottoms out around
 *    250 KiB no matter how far the quality drops). Compositing the wash onto
 *    the colour the header already paints behind it throws the alpha channel
 *    away for free and lands at ~76 KiB instead.
 * 2. A CSS background is invisible to the browser's preload scanner, so
 *    Layout.astro preloads this URL from <head> to get the request started
 *    alongside the stylesheet instead of after it.
 * 3. Because the image is pre-composited, the flattened area is only invisible
 *    while it matches the card underneath — that's why the colour is read from
 *    the token rather than typed in, and why `.header` must keep painting
 *    `background-color: var(--color-accent)`.
 *
 * Called (and awaited) from component frontmatter, not resolved at module
 * scope: the image service only exists during a render pass. Repeat calls with
 * these arguments resolve to the same generated file.
 */
export function headerBackground() {
  return getImage({
    src: trees,
    format: 'webp',
    quality: 85,
    background: colorToken('--color-accent'),
  });
}
