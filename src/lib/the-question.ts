import { getCollection, type CollectionEntry } from 'astro:content';

export type Episode = CollectionEntry<'episodes'>;

/** The show runs on Eastern time, and its dates read that way wherever shown. */
const EASTERN = 'America/New_York';

export const PAST_EPISODES_URL = 'https://bencallahan.com/the-question';

export const PREVIOUS_EPISODES_URL = 'https://bencallahan.com/the-question#previous-episodes';

/**
 * Open while there's a survey to answer, closed the rest of the time — which
 * covers both a question that has finished and one whose file is in but whose
 * `opensOn` hasn't arrived. The card has one resting panel and says the same
 * thing in either case, so it has no use for a third state.
 */
export type QuestionState = 'open' | 'closed';

/**
 * The card's whole rule, written as the moments it changes at: each step
 * applies from `at` until the next one. The build renders the card and the
 * browser picks a state from this same array, so the two can't disagree —
 * which is only guaranteed while there is one rule. This is it.
 *
 * `at` is epoch milliseconds, which survives the trip into an inline script
 * with no parsing at the other end.
 */
export function questionSchedule(episode: Episode): { at: number; state: QuestionState }[] {
  const { answerBy, answerUrl, opensOn } = episode.data;

  /* An archived episode never opens: no deadline, or nowhere to answer. */
  if (!answerBy || !answerUrl) return [{ at: 0, state: 'closed' }];

  return [
    { at: 0, state: opensOn ? 'closed' : 'open' },
    ...(opensOn ? [{ at: opensOn.getTime(), state: 'open' as const }] : []),
    { at: answerBy.getTime(), state: 'closed' },
  ];
}

/**
 * The one the card is about: simply the newest. Drop the next episode's file
 * in and it takes over, the same way it does on bencallahan.com — which is
 * also why a repo holding one file and a repo holding eighty-five both work.
 */
export async function currentEpisode(): Promise<Episode | undefined> {
  const episodes = await getCollection('episodes');
  return episodes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())[0];
}

/** "083", the way the show numbers itself — not 83. */
export const episodeNumber = ({ data }: Episode) =>
  `${String(data.number).padStart(3, '0')}${data.part ? ` Part ${data.part}` : ''}`;

/** "October 29" */
export const monthDay = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: EASTERN,
  }).format(date);
