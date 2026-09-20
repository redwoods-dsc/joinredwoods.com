import type { Question } from '../lib/the-question';

// ─── The only file to edit when a new question goes live ─────────────────────
//
// Overwrite the fields below and push. There is no step to take a question
// down: once `answerBy` passes, the sidebar card falls back to the mailing-list
// state on its own, in the browser, without a rebuild.
//
// Dates are written in UTC because that is what `new Date(...)` parses
// unambiguously. Ben runs the show on Eastern time, so convert before writing
// them here — noon Eastern is 16:00Z, 5pm Eastern is 21:00Z.

export const currentQuestion: Question = {
  number: 81,
  question: 'The Culture We Build',
  cohosts: ['Shaun Bent'],
  episodeDate: new Date('2026-09-24T16:00:00Z'),
  answerBy: new Date('2026-09-23T21:00:00Z'),
  answerUrl: 'https://bit.ly/4dNe2AF',
};
