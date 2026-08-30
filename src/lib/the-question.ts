export interface Question {
  /** Episode number, as Ben numbers them on bencallahan.com. */
  number: number;
  /** The question itself, as posed to the community. */
  question: string;
  /** Guest co-host(s) for this episode. */
  cohosts: string[];
  /** When the live discussion happens. */
  episodeDate: Date;
  /** When the survey closes. The only thing that decides live vs. fallback. */
  answerBy: Date;
  /** Survey people answer to earn an invite to the live discussion. */
  answerUrl: string;
}

export const PAST_EPISODES_URL = 'https://bencallahan.com/the-question';

export const PREVIOUS_EPISODES_URL = 'https://bencallahan.com/the-question#previous-episodes';

export const MAILING_LIST_URL = 'https://bencallahan.com/the-question#signup';

/**
 * A question is live until its survey closes. Deliberately the single rule the
 * build and the browser both apply, so the two can never disagree about state.
 */
export function isLive(question: Question, now: Date = new Date()): boolean {
  return question.answerBy.getTime() > now.getTime();
}
