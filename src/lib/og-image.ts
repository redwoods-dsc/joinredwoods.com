import { getImage } from 'astro:assets';
import ogCard from '../assets/og-card.png';
import { colorToken } from './tokens';

/** Facebook, LinkedIn and X all crop to this; anything else gets letterboxed. */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/* The ground each tone flattens onto, from the tokens Callout and EntryCard
   already paint these tones with. The card's wordmark is baked cream, so a new
   tone's ground has to clear 3:1 against it — green and blue are 3.99:1. */
const TONE_GROUNDS = {
  green: '--color-green',
  blue: '--color-blue',
  orange: '--color-accent',
} as const;

export type Tone = keyof typeof TONE_GROUNDS;

/**
 * Resolves a page's social card to a 1200×630 JPEG.
 *
 * JPEG rather than WebP on purpose: the crawlers that unfurl these links are
 * not browsers, and several of them still won't render a WebP card.
 *
 * The default card is `og-card.png` — the wordmark, tagline and header trees
 * laid out on a *transparent* 1200×630 canvas. The ground behind them is
 * flattened in here from tokens.css rather than baked into the asset, for the
 * same reason header-background.ts does it: re-theming a colour shouldn't
 * silently leave a stale one in the thing everyone sees when a link is shared.
 * Same trick, opposite motivation — there it also buys back 600 KiB.
 *
 * An article's `tone` picks that ground, so its link unfurls in the colour the
 * article already wears on the page.
 */
export async function ogImage(image?: ImageMetadata, tone?: Tone) {
  if (image && (image.width < OG_WIDTH || image.height < OG_HEIGHT)) {
    /* Astro's sharp service passes `withoutEnlargement`, so a smaller source
       silently yields a smaller card and the og:image:width/height below
       become a lie. Fail loudly instead — the fix is a bigger source image. */
    throw new Error(
      `Social card images must be at least ${OG_WIDTH}×${OG_HEIGHT}; ` +
        `got ${image.width}×${image.height} for ${image.src}.`,
    );
  }

  return getImage({
    src: image ?? ogCard,
    format: 'jpeg',
    quality: 90,
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fit: 'cover',
    position: 'center',
    background: colorToken(tone ? TONE_GROUNDS[tone] : '--color-accent'),
  });
}

export const ogImageSize = { width: OG_WIDTH, height: OG_HEIGHT };
