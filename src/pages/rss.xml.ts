import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection(
    'posts',
    entry => !entry.data.draft && !entry.data.skipRSS
  );

  const sorted = posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: 'Redwoods — A Design System Community',
    description:
      'Redwoods is a group of life-long learners committed to supporting each other on the journey of design system maturity.',
    site: context.site!,
    items: sorted.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: post.data.externalLink ?? `/posts/${post.id}/`,
    })),
  });
}
