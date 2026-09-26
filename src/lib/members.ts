import { RANGERS } from '../data/rangers';

export interface Member {
  slug: string;
  name: string;
  title?: string;
  linkedin?: string;
  /* The first link a member listed that isn't LinkedIn. Slack gives them five
     fields all labelled "Link" with nothing to tell them apart, so the host is
     the only signal for what a URL is. */
  website?: string;
  /* Filename in src/assets/members. Absent for the members who have never set
     a profile picture. */
  avatar?: string;
  /* Slack changes this when the photo changes; sync-members.mjs uses it to skip
     re-downloading what it already has. */
  avatarHash?: string;
}

const RANGER_SLUGS = new Set(RANGERS.map((ranger) => ranger.slug));

/* Rangers are marked by a tree after their name, not in their title. */
export function isRanger(slug: string): boolean {
  return RANGER_SLUGS.has(slug);
}

/* Emoji only where they carry their own presentation, so a trademark or
   copyright sign in a company name survives. Skin tones, keycaps and the
   joiners that hold a sequence together go with them. */
const EMOJI =
  /\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|[\u{1F3FB}-\u{1F3FF}\u200D\u20E3]/gu;

/* Left lowercase inside a title, the way a headline would set them. */
const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'via',
  'with',
]);

/* A word carrying a capital of its own is already how its owner writes it —
   UX, GetYourGuide, HP — so only all-lowercase words are touched. Capitals
   follow an opening bracket or a hyphen too, for "(design systems)" and
   "front-end". */
const initCap = (title: string) =>
  title
    .split(' ')
    .map((word, i) => {
      if (/[A-Z]/.test(word)) return word;
      if (i > 0 && SMALL_WORDS.has(word)) return word;
      return word.replace(
        /(^|[-/(])([a-z])/g,
        (_, before, letter) => before + letter.toUpperCase(),
      );
    })
    .join(' ');

/* The line under a member's name: what they entered in Slack, or "Redwoods
   Member" when they left it empty.

   Tidied rather than reproduced, because a column of Slack titles reads as a
   jumble otherwise: emoji go, "@" becomes "at", and the capitalisation is
   evened out. The words themselves are theirs, and members.json keeps them as
   typed. */
export function memberTitle({ title }: Pick<Member, 'title'>): string {
  if (!title) return 'Redwoods Member';

  const tidied = initCap(
    title.replace(EMOJI, '').replace(/@\s*/g, 'at ').replace(/\s+/g, ' ').trim(),
  );

  return tidied || 'Redwoods Member';
}
