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

/* The same frontmatter bencallahan.com's episodes collection takes, field for
   field, so one file describes an episode on both sites and moves between them
   unedited. This card reads a handful of them; the rest are declared anyway,
   because z.object() drops what it doesn't name without a word, and a dropped
   field looks exactly like a file that had no effect. Keep the two in step. */
const episodes = defineCollection({
  /* Numbered files only, so a _template.md can sit beside them. */
  loader: glob({ pattern: '[0-9]*.md', base: './src/content/episodes' }),
  /* Passthrough because the file is shared with bencallahan.com and carries
     fields only that site renders. Declaring the ones this card reads keeps
     them validated; passthrough keeps the rest from being dropped silently. */
  schema: z
    .object({
      number: z.number().int().positive(),
      /* "II" for the one episode that ran to two parts. */
      part: z.string().optional(),
      title: z.string(),
      date: z.coerce.date(),
      cohosts: z.array(z.object({ name: z.string(), url: z.url() })).default([]),
      opensOn: z.coerce.date().optional(),
      topic: z.string().optional(),
      answerBy: z.coerce.date().optional(),
      answerUrl: z.url().optional(),
    })
    .passthrough(),
});

export const collections = { 'field-notes': fieldNotes, episodes };
