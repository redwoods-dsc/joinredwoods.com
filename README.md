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

| Command        | What it does                                                            |
| -------------- | ----------------------------------------------------------------------- |
| `pnpm install` | Install dependencies                                                    |
| `pnpm dev`     | Start the local dev server at <http://localhost:4321/>                  |
| `pnpm build`   | Build the production site to `./dist/`                                  |
| `pnpm preview` | Preview the production build locally                                    |
| `pnpm astro …` | Run any Astro CLI command (e.g. `pnpm astro check`)                     |

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
- **Assets** in `src/assets/` are optimised by Astro when imported from a component. Files in `public/` are copied to the build as-is — use this for the favicon, `robots.txt`, fonts you want to self-host, and similar static files. When referencing a `public/` file in an `href` or `src`, prefix it with `import.meta.env.BASE_URL` (or it'll 404 in production under the project subpath). See `Layout.astro` for the favicon pattern.

The build output in `./dist/` is fully static and can be hosted on any static host (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, etc.).

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

- **Named colors** — `--color-orange`, `--color-woodland`, `--color-green`, `--color-blue`, `--color-cream`
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
