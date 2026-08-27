# 🌲 Redwood Design System Community

The community website for the Redwood Design System, built with [Astro](https://astro.build).

This README documents how to run the site locally, how the codebase is organised, and the conventions we follow. If anything here is out of date or unclear, please open a PR. 👋

## 📋 Prerequisites

You need the following installed before running the site:

- **Node.js 22.12 or newer.** The easiest way to manage Node versions is with a version manager like [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm) — these let you switch Node versions per project without touching your system install.
- **pnpm.** We use pnpm as the package manager. Install it once with `npm install -g pnpm`, or follow the [official install guide](https://pnpm.io/installation).
- **A code editor.** Anything works. [VS Code](https://code.visualstudio.com) with the official [Astro](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode) extension gives you syntax highlighting and diagnostics out of the box.

## 🚀 Getting started

1. Clone the repo and move into it.

   ```sh
   git clone git@github.com:redwoods-dsc/joinredwoods.com.git
   cd joinredwoods.com
   ```

2. Install dependencies.

   ```sh
   pnpm install
   ```

3. Start the dev server.

   ```sh
   pnpm dev
   ```

   Open <http://localhost:4321/> in your browser. Edits hot-reload automatically. The style guide lives at <http://localhost:4321/style-guide/>. ✨

## 🧞 Available commands

Run everything from the project root.

| Command        | What it does                                           |
| -------------- | ------------------------------------------------------ |
| `pnpm install` | Install dependencies                                   |
| `pnpm dev`     | Start the local dev server at <http://localhost:4321/> |
| `pnpm build`   | Build the production site to `./dist/`                 |
| `pnpm preview` | Preview the production build locally                   |
| `pnpm astro …` | Run any Astro CLI command (e.g. `pnpm astro check`)    |

## 📁 Project structure

```text
/
├── public/                   # Static files copied verbatim to the build root
│   └── favicon.svg
├── src/
│   ├── assets/               # Images/media processed by Astro's asset pipeline
│   ├── components/           # Reusable .astro components (flat hierarchy)
│   │   ├── Button.astro
│   │   └── Page.astro        # Global chrome — wraps every page (see Architecture)
│   ├── data/                 # Hand-maintained content that isn't a page
│   │   └── the-question.ts   # The Question — see "Updating The Question" below
│   ├── layouts/              # Shared page shells (html, head, body, <slot />)
│   │   ├── Home.astro
│   │   └── Layout.astro
│   ├── pages/                # File-based routes — each .astro is a URL
│   │   ├── index.astro       # → /
│   │   └── style-guide.astro # → /style-guide
│   └── styles/               # Global stylesheets (see "Styling" below)
│       ├── tokens.css
│       ├── normalize.css
│       ├── reset.css
│       ├── base.css
│       └── global.css
└── astro.config.mjs
```

## 🏗️ Architecture

Astro is a static site generator. At build time, every `.astro` file in `src/pages/` becomes an HTML page; everything ships as plain HTML, CSS, and (optionally) JavaScript.

- **Pages** (`src/pages/`) use file-based routing — `src/pages/foo/bar.astro` renders at `/foo/bar`. Pages can also be Markdown or MDX once we add content.
- **Layouts** (`src/layouts/Layout.astro`) are page shells that supply the surrounding `<html>`, `<head>`, and `<body>`. A page imports a layout and drops its content into the layout's `<slot />`. `Home.astro` is a page-specific layout that adds the homepage header on top of `Layout`.
- **The Page component** (`src/components/Page.astro`) is the global visual chrome that wraps every page — an outer padded frame, a rounded inner surface that holds the actual page content, and the vertical copyright mark. `Layout.astro` drops `<Page>` around its `<slot />`, so anything rendered through the default layout automatically picks up the chrome. If you ever need a full-bleed page (a landing hero, an OG image route), bypass the default layout rather than fighting the Page wrapper.
- **Components** (`src/components/`) are reusable `.astro` fragments — buttons, cards, navigation, etc. They are server-rendered by default and ship zero JavaScript unless a [`client:*` directive](https://docs.astro.build/en/reference/directives-reference/#client-directives) is explicitly added.
- **Assets** in `src/assets/` are optimised by Astro when imported from a component. Files in `public/` are copied to the build as-is — use this for the favicon, `robots.txt`, fonts you want to self-host, and similar static files. See `Layout.astro` for the favicon pattern.

The build output in `./dist/` is fully static and can be hosted on any static host (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, etc.).

## 🔍 SEO and metadata

Page metadata is centralised rather than sprinkled through pages. `src/components/Seo.astro` builds the `<head>` — title, meta description, canonical URL, Open Graph and Twitter cards, and a JSON-LD block — and `Layout.astro` renders it on every page. You don't import it directly; you hand `Layout` (or `ContentPage`, which forwards its whole prop set through) a couple of props:

```astro
<Layout title="Field Notes" description="Analysis and synthesis from the Redwoods community." />
```

Markdown and MDX pages do the same thing in frontmatter, where `description` falls back to `subtitle`:

```markdown
---
layout: ../layouts/ContentPage.astro
title: Redwoods Code of Conduct
subtitle: We take this code of conduct seriously, and we trust that you will too.
---
```

Titles leave the site name off — `Seo` appends it, and is smart enough not to produce `Welcome to Redwoods | Redwoods`.

A few pieces sit behind that:

- **`src/lib/site.ts`** — the site's name, default title and description, locale, and the social profiles that feed structured data. The canonical origin is _not_ here: it's `site` in `astro.config.mjs`, and `Seo` reads it back off `Astro.site` so the two can't drift.
- **`src/lib/og-image.ts`** — generates 1200×630 social cards through the image pipeline. Articles use their own `image` (which must be at least 1200×630, or the build stops rather than shipping a card whose meta tags overstate its size); everything else falls back to `src/assets/og-card.png`, the wordmark and trees on a transparent canvas that gets flattened onto the accent colour at build time. They're JPEGs on purpose, because link unfurlers aren't browsers and several still won't render WebP.
- **Articles** get richer treatment automatically from their collection frontmatter — `og:type=article`, published and modified timestamps, per-author tags, and a `BlogPosting` schema. Other pages get an `Organization` schema.
- **`sitemap-index.xml`** is generated at build time by `@astrojs/sitemap`, so new pages show up without anyone remembering to add them and drafts never appear. `public/robots.txt` points at it.

To check what a page actually emits, run `pnpm build` and read the `<head>` of the matching file in `dist/`.

## ❓ Updating The Question

[The Question](https://bencallahan.com/the-question) is the fortnightly community survey and live discussion Ben runs alongside Redwoods. The sidebar advertises it, and **`src/data/the-question.ts` is the only file you need to touch**:

```ts
export const currentQuestion: Question = {
  number: 80,
  question: 'How do we visualise design system health?',
  cohosts: ['Robin Di Capua', 'Taylor Cashdan'],
  episodeDate: new Date('2026-08-28T16:00:00Z'), // Fri 28 Aug 2026, noon Eastern
  answerBy: new Date('2026-08-27T21:00:00Z'), // Wed 27 Aug 2026, 5pm Eastern
  answerUrl: 'https://bit.ly/4wVx4fe',
};
```

Overwrite the fields and push. That's the whole job — **there is no step to take a question down.** `answerBy` is the only thing that decides which state the card shows: while it's in the future the card promotes the open question, and once it passes the card falls back to the mailing-list signup by itself. The link to past episodes is there either way.

That fallback happens in the browser, because it has to. The site is statically built and nothing rebuilds it at the moment a survey closes, so `Layout.astro` writes a few lines of inline script into the document `<head>` that re-check the deadline and, if it has passed, set `data-question-expired` on `<html>`. `QuestionPromo.astro` has both states in the markup and swaps them on that attribute in CSS. Two things follow from that:

- The check runs **before any of the page body is parsed**, which is the point — deciding it further down the page would let a closed question flash on screen first. If you move that script, keep it in the head.
- It only ever moves the card from open to closed, never the other way. A new question can't appear without a build, so there's nothing to undo.

Both states are on the [style guide](http://localhost:4321/style-guide#question-promo) if you want to look at them side by side.

## 📝 Writing a Field Note

Articles are MDX files in `src/content/articles/`. The filename becomes the URL — `analysis-vs-synthesis.mdx` renders at `/field-notes/analysis-vs-synthesis/`. Frontmatter is validated against the schema in `src/content.config.ts`, so a missing or misspelled field stops the build rather than shipping a broken page:

```mdx
---
title: 'Analysis vs Synthesis'
date: 2026-03-05
authors: ['Ben Callahan']
description: 'Why the two halves of the work need different rooms.'
draft: false
---
```

`title`, `date` and `authors` are the only required fields; everything else has a default or is optional. Set `modifiedDate` when an edit changes the substance rather than fixing a typo, `tags` to group pieces, `image` and `imageAlt` for a custom social card (at least 1200×630, or the build stops), and `draft: true` to keep something out entirely — drafts never produce a route, so they stay out of the sitemap for free.

**`tone` picks the colour of the entry card** the piece gets in the sidebar. `green` is for articles and `blue` is for news and events, so most Field Notes want `green` — which is the default, and can be left out. Only the exceptions need saying, as `tone: blue`. The schema only accepts those two, so a typo fails the build instead of quietly rendering the default card. Both are side by side on the [style guide](http://localhost:4321/style-guide#entry-card).

## 🎨 Styling

We use **plain CSS** — no Tailwind, no CSS-in-JS, no Sass. Modern CSS covers everything we need and Astro compiles it with zero config.

### Cascade layers

`src/styles/global.css` declares a single layer order for the entire site:

```css
@layer normalize, reset, tokens, base;
```

Layers let us control the cascade without specificity wars or `!important`. One important property: **unlayered rules always win over layered ones**, regardless of selector specificity. That means scoped component styles (see below) automatically override anything in `base.css`.

| Stylesheet      | Responsibility                                                                      |
| --------------- | ----------------------------------------------------------------------------------- |
| `normalize.css` | Cross-browser baseline                                                              |
| `reset.css`     | Minimal opinionated reset on top of normalize                                       |
| `tokens.css`    | Design tokens as CSS custom properties — colors, spacing, type, radii, motion, etc. |
| `base.css`      | Element defaults (body, headings, links, code, etc.) wired through tokens           |
| `global.css`    | Entry file — declares layer order and imports the rest                              |

`Layout.astro` imports `global.css` once in its frontmatter, which loads the whole stack on every page.

### Design tokens

All design decisions live in `src/styles/tokens.css` as CSS custom properties on `:root`. Components reference them with `var(--color-accent)` and similar — never hard-coded values.

- **Named colors** — `--color-orange`, `--color-green`, `--color-blue`, `--color-cream`
- **Gray scale** — `--color-gray-00` (black) through `--color-gray-100` (white)
- **Semantic aliases** — `--color-bg`, `--color-surface`, `--color-text`, `--color-border`, `--color-accent`, `--color-accent-contrast`, `--color-focus`
- **Type** — `--font-sans`, `--font-serif`, `--font-mono`, plus `--font-size-*` (rem), `--font-weight-*`, `--line-height-*`
- **Spacing / radii / layout** — `--space-*`, `--radius-*`, `--layout-*` (all px)
- **Motion** — `--motion-duration-*`, `--motion-ease-*`

**Prefer semantic aliases in components** whenever one exists. Reach for the raw palette or gray scale only when defining a new semantic alias.

### Component styles

Every reusable UI primitive is an `.astro` file under `src/components/` with its own scoped `<style>` block. Astro hashes scoped selectors automatically, so styles never leak across components and there's no BEM-style naming convention to follow.

```astro
---
// src/components/Example.astro
---

<button class="example">
  <slot />
</button>

<style>
  .example {
    background: var(--color-accent);
    color: var(--color-accent-contrast);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
  }
</style>
```

A few rules:

- Don't add component-level classes to `global.css` or spin up a shared `components.css`. Each component owns its styles.
- Use `<style is:global>` only for genuinely cross-cutting concerns (rare).
- Always use tokens instead of raw values — this is what makes the design system cohesive.

### The style guide

`/style-guide` is a living reference of every token and primitive in the codebase. When you add a new token or component, add it to the style guide too — it's how contributors discover what already exists before reinventing. 🔍

Run `pnpm dev` and visit <http://localhost:4321/style-guide/>.

## 🤝 Contributing

1. Create a branch from `main`.
2. Make your change. If you touch styling, check the style guide and reuse existing tokens before introducing new ones.
3. Run `pnpm build` to make sure the site still builds, then push.
4. Open a PR and describe what you changed and why.

## 📚 Learn more

- [Astro documentation](https://docs.astro.build)
- [Astro project structure guide](https://docs.astro.build/en/basics/project-structure/)
- [CSS cascade layers on MDN](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_layers)
