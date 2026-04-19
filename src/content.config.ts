import { defineCollection } from 'astro:content';
import { z } from 'astro/zod'
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      type: z.enum(['article', 'event', 'promo', 'video']),
      authors: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      externalLink: z.string().optional(),
      publishedOn: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageStyle: z.string().optional(),
      presented: z.string().optional(),
      dayRange: z.string().optional(),
      month: z.string().optional(),
      draft: z.boolean().default(false),
      skipRSS: z.boolean().default(false),
    }),
});

export const collections = { posts };
