import { getCollection, type CollectionEntry } from 'astro:content';

export type Episode = CollectionEntry<'episodes'>;

/** The show runs on Eastern time, and its dates read that way wherever shown. */
const EASTERN = 'America/New_York';

export const PAST_EPISODES_URL = 'https://bencallahan.com/the-question';

export const PREVIOUS_EPISODES_URL = 'https://bencallahan.com/the-question#previous-episodes';

export const MAILING_LIST_URL = 'https://bencallahan.com/the-question#signup';

/**
 * Where the week is. `scheduled` until `opensOn` if the episode is set up
 * ahead, open until the survey closes, then closed.
 */
export type QuestionState = 'scheduled' | 'open' | 'closed';

/**
 * The card's whole rule, written as the moments it changes at: each step
 * applies from `at` until the next one. The build renders the card and the
 * browser picks a state from this same array, so the two can't disagree —
 * which is only guaranteed while there is one rule. This is it.
 *
 * `at` is epoch milliseconds, which survives the trip into an inline script
 * with no parsing at the other end.
 *
 * Mirrors episodeSchedule() in bencallahan.com, minus its `missed` state: that
 * site nudges anyone who arrives between the deadline and the deep dive, and
 * this card says the same thing to them as it does to anyone else.
 */
export function questionSchedule(episode: Episode): { at: number; state: QuestionState }[] {
  const { answerBy, answerUrl, opensOn } = episode.data;

  /* An archived episode never opens: no deadline, or nowhere to answer. */
  if (!answerBy || !answerUrl) return [{ at: 0, state: 'closed' }];

  return [
    { at: 0, state: opensOn ? 'scheduled' : 'open' },
    ...(opensOn ? [{ at: opensOn.getTime(), state: 'open' as const }] : []),
    { at: answerBy.getTime(), state: 'closed' },
  ];
}

/** Shared by the build and, in spirit, by the inline script in Layout.astro. */
export function stateAt(
  schedule: { at: number; state: QuestionState }[],
  now: number,
): QuestionState {
  let state = schedule[0].state;
  for (const step of schedule) if (now >= step.at) state = step.state;
  return state;
}

/** Where the schedule stands at a given moment. */
export function questionState(episode: Episode, now = new Date()): QuestionState {
  return stateAt(questionSchedule(episode), now.getTime());
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

const formatter = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone: EASTERN });

/** "October 29" */
export const monthDay = (date: Date) => formatter({ month: 'long', day: 'numeric' }).format(date);

/** "Wednesday" */
export const weekday = (date: Date) => formatter({ weekday: 'long' }).format(date);

/** "Noon", "5PM" — the way the show writes its times. */
export function timeOfDay(date: Date) {
  const parts = formatter({ hour: 'numeric', minute: '2-digit' }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  if (get('hour') === '12' && get('minute') === '00' && get('dayPeriod') === 'PM') return 'Noon';
  const minutes = get('minute') === '00' ? '' : `:${get('minute')}`;
  return `${get('hour')}${minutes}${get('dayPeriod')}`;
}

/** "Opens Sunday, October 25, at Noon Eastern" and the two lines after it. */
export function scheduleLines(episode: Episode): string[] {
  const { opensOn, answerBy, date } = episode.data;
  const at = (moment: Date) =>
    `${weekday(moment)}, ${monthDay(moment)}, at ${timeOfDay(moment)} Eastern`;
  return [
    ...(opensOn ? [`Opens ${at(opensOn)}`] : []),
    ...(answerBy ? [`Answer by ${at(answerBy)}`] : []),
    `Deep dive ${at(date)}`,
  ];
}
