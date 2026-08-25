/**
 * One place for the facts every page's <head> repeats. Mirrors the shape of a
 * classic site data file: identity, defaults, and the handles that structured
 * data points at.
 *
 * The canonical origin deliberately isn't here — it lives in `site` in
 * astro.config.mjs, which Astro already uses to build absolute URLs, and Seo
 * reads it back off `Astro.site`. Two copies of the origin is exactly the kind
 * of pair that drifts.
 */
export const site = {
  name: 'Redwoods',
  /** Used verbatim on the homepage; every other page appends `titleSuffix`. */
  title: 'Redwoods — A Design System Community',
  titleSuffix: 'Redwoods',
  description:
    'Redwoods is a group of life-long learners committed to supporting each other on the journey of design system maturity.',
  lang: 'en',
  locale: 'en_US',

  /** Falls back to the trees card generated in lib/og-image.ts. */
  imageAlt: 'Redwoods — a design system community',

  organization: {
    name: 'Redwoods',
    /* No verified profiles to point `sameAs` at yet. Add them here rather than
       in the schema partial — Google treats them as identity signals, so a
       wrong URL is worse than a missing one. */
    sameAs: [] as string[],
  },
} as const;
