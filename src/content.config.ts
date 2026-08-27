import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      /* Surfaces as article:modified_time and schema.org dateModified. Set it
         when an edit changes the substance, not for a typo fix. */
      modifiedDate: z.coerce.date().optional(),
      description: z.string().optional(),
      authors: z.array(z.string()).min(1),
      tags: z.array(z.string()).default([]),
      tone: z.enum(['green', 'blue']).default('green'),
      image: image().optional(),
      imageAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { articles };
