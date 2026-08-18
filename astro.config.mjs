// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://joinredwoods.com',
  integrations: [mdx()],
  build: {
    // The page stylesheet is the only render-blocking request left, and at
    // ~4.7 KiB gzipped it costs more as a round trip than it does inline:
    // measured locally, inlining takes FCP from 1057ms to 903ms. The trade is
    // that CSS is no longer cached across page navigations, which is the right
    // way round for a small site whose traffic is mostly first-visit.
    inlineStylesheets: 'always',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light-high-contrast',
    },
  },
});
