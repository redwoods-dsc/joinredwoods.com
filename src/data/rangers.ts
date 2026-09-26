// ─── The Redwoods Rangers ────────────────────────────────────────────────────
//
// Matched on slug, not name: the slug is what sync-members.mjs derives from each
// person's Slack name, and Slack names don't always read the way you'd type them
// (Robin is "robin-di-capua" there). The names are only so this list stays
// readable, so a Ranger who edits their Slack name needs the slug here changed
// to match — nothing fails, they just stop being a Ranger.
//
// A Ranger who hasn't opted in to /members is still listed here; they simply
// don't appear until they do.

export const RANGERS = [
  { slug: 'ben-callahan', name: 'Ben Callahan' },
  { slug: 'shaun-bent', name: 'Shaun Bent' },
  { slug: 'lauren-loprete', name: 'Lauren LoPrete' },
  { slug: 'toniann-drenckhahn', name: 'ToniAnn Drenckhahn' },
  { slug: 'robin-di-capua', name: 'Robin Di Capua' },
  { slug: 'doug-neiner', name: 'Doug Neiner' },
];
