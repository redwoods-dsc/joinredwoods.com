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

/* The line under a member's name. Untitled members read "Redwoods Member";
   Rangers take ", Redwoods Ranger" on the end of whatever they have. An
   untitled Ranger is just "Redwoods Ranger" rather than both at once, and a
   title that already says so is left as the member wrote it. */
export function memberTitle({ slug, title }: Pick<Member, 'slug' | 'title'>): string {
  if (!RANGER_SLUGS.has(slug)) return title ?? 'Redwoods Member';
  if (!title) return 'Redwoods Ranger';
  if (/redwoods ranger/i.test(title)) return title;
  return `${title}, Redwoods Ranger`;
}
