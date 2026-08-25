import type { Question } from '../lib/the-question';

// ─── The only file to edit when a new question goes live ─────────────────────
//
// Overwrite the fields below and push. There is no step to take a question
// down: once `answerBy` passes, the sidebar card falls back to the mailing-list
// state on its own, in the browser, without a rebuild.
//
// Dates are written in UTC because that is what `new Date(...)` parses
// unambiguously. Ben runs the show on Eastern time, so convert first — the
// trailing comments record the local time each value came from.

export const currentQuestion: Question = {
  number: 80,
  question: 'How do we visualise design system health?',
  cohosts: ['Robin Di Capua', 'Taylor Cashdan'],
  episodeDate: new Date('2026-08-28T16:00:00Z'), // Fri 28 Aug 2026, noon Eastern
  answerBy: new Date('2026-08-27T21:00:00Z'), // Wed 27 Aug 2026, 5pm Eastern
  answerUrl: 'https://bit.ly/4wVx4fe',
};
