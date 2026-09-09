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
