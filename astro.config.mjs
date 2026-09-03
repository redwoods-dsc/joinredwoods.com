// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/**
 * Turns `![caption](image.jpg)` into a figure with the alt text as its caption,
 * so authors keep writing plain markdown and get a captioned image.
 *
 * The alt is emptied on the way past. Left in place a screen reader announces
 * the same sentence twice — once as the image's description, once as the
 * caption sitting right below it. Only markdown images are touched: an <Image>
 * written in MDX is JSX by the time this runs, not an `img` element.
 */
function rehypeFigureCaptions() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        walk(child);
        const isLoneImage =
          child.type === 'element' &&
          child.tagName === 'p' &&
          child.children.filter((c) => c.type !== 'text' || c.value.trim()).length === 1 &&
          child.children.some((c) => c.type === 'element' && c.tagName === 'img');
        if (!isLoneImage) return child;

        const img = child.children.find((c) => c.type === 'element' && c.tagName === 'img');
        const caption = img.properties.alt;
        if (!caption) return child;
        img.properties.alt = '';

        return {
          type: 'element',
          tagName: 'figure',
          properties: {},
          children: [
            img,
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {},
              children: [{ type: 'text', value: caption }],
            },
          ],
        };
      });
    };
    walk(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://joinredwoods.com',
  integrations: [
    mdx(),
    /* Auto-discovers every built page, which means draft articles are already
       excluded — they never produce a route. The style guide is an internal
       reference, so it stays out here as well as carrying `noindex`. Author
       pages are out for a different reason: nothing links to them, and they
       carry only a name and a list the Field Notes index already shows. */
    sitemap({
      filter: (page) => !page.includes('/style-guide') && !page.includes('/field-notes/authors/'),
    }),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        // The header trees are the only thing that asks the pipeline for PNG,
        // and they're a duotone, so quantising them is free of banding. It's
        // what keeps the flat area on --color-accent to the byte — see
        // lib/header-background.ts.
        png: { palette: true, quality: 60, colours: 64, dither: 0.5 },
      },
    },
  },
  build: {
    // The page stylesheet is the only render-blocking request left, and at
    // ~4.7 KiB gzipped it costs more as a round trip than it does inline:
    // measured locally, inlining takes FCP from 1057ms to 903ms. The trade is
    // that CSS is no longer cached across page navigations, which is the right
    // way round for a small site whose traffic is mostly first-visit.
    inlineStylesheets: 'always',
  },
  markdown: {
    rehypePlugins: [rehypeFigureCaptions],
    shikiConfig: {
      theme: 'github-light-high-contrast',
    },
  },
});
