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
├── .github/
│   └── workflows/            # CI — visual regression, and the weekly member sync
├── public/                   # Static files copied verbatim to the build root
│   └── favicon.svg
├── scripts/                  # Run by a person or a workflow, never by the build
│   └── sync-members.mjs      # Slack → /members — see "Updating the member list" below
├── src/
│   ├── assets/               # Site-wide images/media, processed by Astro's pipeline
│   ├── components/           # Reusable .astro components (flat hierarchy)
│   │   ├── Button.astro
│   │   └── Page.astro        # Global chrome — wraps every page (see Architecture)
│   ├── content/              # Content collections
│   │   └── field-notes/      # One directory per article, images beside it
│   │       └── a-field-note/
│   │           ├── images/
│   │           └── index.mdx
│   ├── data/                 # Hand-maintained content that isn't a page
│   │   ├── members.json      # Written by scripts/sync-members.mjs — don't hand-edit
│   │   ├── rangers.ts        # The Redwoods Rangers, by slug
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
- **Assets** in `src/assets/` are optimised by Astro when imported from a component. That directory is for artwork the site as a whole uses — an article's own images live with the article (see [Writing a Field Note](#-writing-a-field-note)). Files in `public/` are copied to the build as-is — use this for the favicon, `robots.txt`, fonts you want to self-host, and similar static files. See `Layout.astro` for the favicon pattern.

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

## 👥 Updating the member list

`/members` lists the people in the Redwoods Slack who have said yes to being on the site. The list comes out of Slack, through a script the build never calls. Usually you'll want [the GitHub workflow](#from-github-by-hand-or-weekly) below, which runs that script for you. To run it on your own machine instead:

```bash
node --env-file=.env scripts/sync-members.mjs
```

It rewrites `src/data/members.json` and the photos in `src/assets/members/`. Look over the diff, commit, and push. **The build never talks to Slack**, so a sync only reaches the site once its output is committed. Don't hand-edit `members.json` either: the next sync overwrites it. If something on a card is wrong, the fix belongs in that person's Slack profile.

### From GitHub, by hand or weekly

You don't have to run it locally. `.github/workflows/sync-members.yml` does the same job:

- **By hand:** Actions → **Sync members** → **Run workflow**. Anyone with write access to the repo can do this, no token or checkout needed. The "force" tick box is the `--force` flag; leave it off unless you've already confirmed a big drop is real.
- **Weekly:** Mondays at 13:00 UTC, on its own.

Either way the result arrives as a **pull request** on the `sync-members` branch, with the names that joined or dropped off in its description. Nothing reaches the site until someone merges it. When Slack and the site already agree, the run finishes without opening anything.

Three things worth knowing:

- It needs a `SLACK_TOKEN` **repository secret** (Settings → Secrets and variables → Actions), which is the same token as the one in `.env`. Without it every run fails.
- A pull request opened by a workflow doesn't start other workflows, so Chromatic won't run on it. Push a commit to the branch, or close and reopen the PR, if you want the visual checks.
- GitHub pauses scheduled workflows in a repository that's had no commits for 60 days. Any commit re-enables it.

### Setting up the token

The script needs a Slack bot token in `.env` at the project root. That file is gitignored, so the token never gets committed. Don't paste it anywhere else either.

```bash
SLACK_TOKEN=xoxb-…
```

To get one, create an app for the Redwoods workspace at [api.slack.com/apps](https://api.slack.com/apps). Under **OAuth & Permissions**, add the `users:read` and `users.profile:read` bot token scopes, install the app to the workspace, and copy the **Bot User OAuth Token**.

### Who shows up, and how

- **Only people who opted in.** Their "Can we list you on the Redwoods website?" profile field has to read exactly `Yes, please!`. Anyone who hasn't answered stays off, because silence isn't consent.
- **Each card shows** the person's real name, their title, a LinkedIn icon, a website icon, and their photo. The LinkedIn icon links to any linkedin.com URL in their profile links. The website icon links to the first other link. Cards are sorted by surname. Someone with no title reads "Redwoods Member". The card supplies that wording, so `members.json` still says exactly what's in Slack.
- **Photos** come from a photo uploaded to Slack, or from the Gravatar behind the account when that's where Slack gets its picture. Anyone with neither gets a drawing of a stand of redwoods from `src/assets/member-stands/`. A photo is downloaded again only when it changes in Slack.

### When it refuses to write

If the member count drops by more than three since the last sync, the script stops without writing anything. An expired token or a rebuilt profile field looks exactly like everyone opting out at once, and publishing that would empty the page. Check the token first. Then run:

```bash
node --env-file=.env scripts/sync-members.mjs --fields
```

That prints the id and label of every custom profile field. Slack identifies the fields by those ids rather than by their labels. The ids are pinned at the top of the script, so update them there if they've changed. If the drop really is people leaving, re-run with `--force`.

### The Rangers

Rangers get a 🌲 after their name. Slack doesn't know who the Rangers are, so they're listed by hand in `src/data/rangers.ts`, **by slug**. A slug is the lowercase, hyphenated form of the Slack name, as it appears in `members.json`. Slack names don't always read the way you'd type them: ToniAnn is `toniann`. A Ranger who hasn't opted in stays listed there and appears once they do. A mistyped slug fails just as quietly, so check `/members` after editing the file.

## 📝 Writing a Field Note

Each article is a directory under `src/content/field-notes/`, holding an `index.mdx` and whatever images it uses:

```text
src/content/field-notes/
└── analysis-vs-synthesis/
    ├── images/
    │   └── two-rooms.jpg
    └── index.mdx
```

The directory name becomes the URL — that one renders at `/field-notes/analysis-vs-synthesis/`. Nothing else in the directory is routed; the loader only picks up `index.mdx`, so a scratch file sitting next to an article stays a scratch file.

Everything the article references is a relative path — `./images/two-rooms.jpg` in the body, in an `import`, and in the `image` frontmatter field. Astro's pipeline optimises them the same as anything in `src/assets/`, which is where artwork shared across the site still belongs. Frontmatter is validated against the schema in `src/content.config.ts`, so a missing or misspelled field stops the build rather than shipping a broken page:

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

**The `title` is the page's `h1`**, so an article's own headings start at `##` and step down one level at a time. The same goes for every other page — see [Heading hierarchy](http://localhost:4321/style-guide#typography) in the style guide.

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
