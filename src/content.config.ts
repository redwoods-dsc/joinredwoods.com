import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const fieldNotes = defineCollection({
  /* One directory per article, with its images beside it. Matching only
     index.mdx keeps a stray draft in that directory from becoming a route. */
  loader: glob({ pattern: '**/index.mdx', base: './src/content/field-notes' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      /* Surfaces as article:modified_time and schema.org dateModified. Set it
         when an edit changes the substance, not for a typo fix. */
      modifiedDate: z.coerce.date().optional(),
      description: z.string().optional(),
      /* The serif lede under an article's title, the same knob ContentPage
         gives a Markdown page. Named here or z.object() drops it silently and
         the frontmatter looks like it simply had no effect. */
      subtitle: z.string().optional(),
      authors: z.array(z.string()).min(1),
      tags: z.array(z.string()).default([]),
      tone: z.enum(['green', 'blue', 'orange']).default('green'),
      image: image().optional(),
      imageAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { 'field-notes': fieldNotes };
