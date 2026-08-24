// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://joinredwoods.com',
  integrations: [
    mdx(),
    /* Auto-discovers every built page, which means draft articles are already
       excluded — they never produce a route. The style guide is an internal
       reference, so it stays out here as well as carrying `noindex`. */
    sitemap({
      filter: (page) => !page.includes('/style-guide'),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light-high-contrast',
    },
  },
});
