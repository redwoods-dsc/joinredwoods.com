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

/* The line under a member's name: what they entered in Slack, or "Redwoods
   Member" when they left it empty. */
export function memberTitle({ title }: Pick<Member, 'title'>): string {
  return title ?? 'Redwoods Member';
}
