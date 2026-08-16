# CLAUDE.md — working on this repo with Claude

This file is project-specific instructions for any Claude instance working in this repo. Claude Code reads it automatically. If you're a human contributor, read the [README](./README.md) first — this file is a complement, not a replacement.

If you update a convention in the codebase, update this file too so the next contributor's Claude inherits it.

## 🧭 Project basics

- **Astro 6** static site, TypeScript strict, no server runtime.
- **pnpm** — not npm, not yarn. Use `pnpm install`, `pnpm dev`, `pnpm build`.
- **Node 22.12+** required.
- The live style guide at `/style-guide` is the canonical reference for tokens and primitives. When you add either, update the style guide in the same change.

## 🪜 Before you edit

1. Skim the [README](./README.md) for the setup and high-level architecture.
2. If you're touching UI or styling, open `/style-guide` in the dev server (`pnpm dev`) — nearly everything you'll want already exists as a token or primitive.
3. Grep for existing patterns before inventing new ones. Reusing beats re-deriving.

## 🎨 Styling rules

These are the ones that are easy to get wrong. Do not deviate without discussion.

- **Plain CSS only.** No Tailwind, no CSS-in-JS, no Sass. Modern CSS (custom properties, nesting, `@layer`, `color-mix()`) covers what we need.
- **Never hard-code design values.** Always `var(--color-accent)`, never `#875231`. Always `var(--space-md)`, never `16px`. Adding a token is fine; hard-coding is not.
- **Prefer semantic aliases** (`--color-bg`, `--color-text`, `--color-accent`) over raw palette tokens (`--color-orange`, `--color-gray-25`). Reach for raw tokens only when defining a new semantic alias.
- **Units:** `--font-size-*` tokens are in `rem` so user scaling works; everything else (`--space-*`, `--radius-*`, `--layout-*`) is in `px`.
- **Cascade layer order** is declared once in `src/styles/global.css`: `normalize, reset, tokens, base`. Anything outside a layer (including scoped component styles) wins over anything inside, so you don't need `!important`.
- **Don't override base element styles.** `base.css` already styles links, headings, lists, and other elements. Scoped component styles should handle layout and spacing — not re-declare colors, text-decoration, or hover states that the base layer provides. Check `/style-guide` before adding element-level styles.
- **Do not create a shared `components.css`.** Component styles live in the component's own `<style>` block (see below). We've had to rip this out once already — don't re-introduce it.

## ⚡ Performance rules

These exist because Lighthouse caught them once. Undoing one costs real score.

- **Fonts are self-hosted**, via `@fontsource-variable/*` imported in `Layout.astro`. Don't reach back for a `<link>` to Google Fonts — that's a render-blocking request on a third-party origin that then chains a second hop for the files. Source Serif 4 uses the `wght` cut (weight axis only); `opsz`/`standard` are ~70 KiB heavier per style and we never vary optical size.
- **Preload the faces every page is certain to paint** — currently roman sans, roman serif, and italic serif (the "Join" link lives in the global nav). Anything content-dependent, like italic sans for an `<em>` or `<cite>`, stays unpreloaded: it's only discovered once the CSS parses, which is the right trade when most pages don't need it.
- **The header trees are the LCP element** on every page. They're a CSS background, which the browser's preload scanner can't see, so `Layout.astro` preloads the URL from `<head>` — hence `src/lib/header-background.ts` sharing one resolved image between the two files. If you change the header artwork, keep both sides in step.
- **That image is pre-composited onto `--color-accent`** and has no alpha channel. The source PNG stores all its detail in alpha, which no amount of WebP quality can compress (it bottoms out ~250 KiB); flattening it onto the colour the card already paints drops it to ~80 KiB. Two consequences: `.header` must keep `background-color: var(--color-accent)` or the flattened rectangle becomes visible, and the flatten colour is read out of `tokens.css` at build time rather than typed in, so re-theming the accent can't silently desync it.
- **Route raster images through the image pipeline.** `getImage()` (or `<Image>`) with `format: 'webp'` — a bare `img.src` from an ESM import ships the untouched original, which is how a 697 KiB PNG ended up on the critical path.
- **Give every `<img>` a `width` and `height`** so the browser can reserve the box. Astro's image imports carry both (`logo.width`, `logo.height`), including for SVGs with only a `viewBox`. Scoped component styles still control the rendered size — they sit outside the cascade layers, so they beat the `img[width]` rule in `reset.css`.

## 🧩 Component conventions

- `src/components/` is **flat** — no `primitives/` or `ui/` subfolder. Every reusable Astro component sits at the top level.
- Every component owns its own scoped `<style>` block. Astro auto-hashes selectors, so styles never leak.
- Use `<style is:global>` only for genuinely cross-cutting concerns (rare — ask if unsure).
- Reference tokens with `var(--…)` inside component styles. Don't hard-code.
- When adding a new component primitive, also add a section for it in `src/pages/style-guide.astro` showing its variants and states.

Example:

```astro
---
interface Props {
  tone?: 'info' | 'warning';
}
const { tone = 'info' } = Astro.props;
---

<div class="callout" data-tone={tone}><slot /></div>

<style>
  .callout {
    padding: var(--space-md);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }
  .callout[data-tone='warning'] {
    background: var(--color-accent);
    color: var(--color-accent-contrast);
  }
</style>
```

## 📄 Content pages

Prose-led pages (code of conduct, policies, anything that's mostly words) are **Markdown by default**. Drop a `.md` file in `src/pages/` and point its frontmatter at a layout — Astro routes it and passes the frontmatter through as `Astro.props.frontmatter`, which `ContentPage` already handles.

```markdown
---
layout: ../layouts/ContentPage.astro
title: Redwoods Code of Conduct
subtitle: We take this code of conduct seriously, and we trust that you will too.
---

### A section heading

Body copy lands in the layout's `<slot />`, so heading spacing and prose styles come for free.
```

See `src/pages/code-of-conduct.md` for the canonical example.

`ContentPage` frontmatter knobs, all optional:

| Key        | Default | What it does                                                                                                      |
| ---------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `title`    | —       | Renders the intro header. Omit it and the page opens straight into body copy.                                     |
| `subtitle` | —       | Serif lede under the title. Ignored without a `title`.                                                            |
| `columns`  | `1`     | `2` drops the prose max-width and flows the body into two balanced CSS columns once the main column passes 640px. |

`columns: 2` also keeps headings on the base spacing scale rather than the roomier single-column rhythm — see the comments in `ContentPage.astro`.

Reach for `.astro` only when the page needs something Markdown can't express — computed frontmatter, `getStaticPaths()`, or bespoke layout. Needing a component is _not_ one of those reasons: `.mdx` imports components fine, and `src/pages/index.mdx` uses `<Button />`, `<Hero />` and `<Quote />` that way. If a `.md` page later needs one component, rename it to `.mdx` rather than rewriting it as `.astro`.

Blog articles are different: they live in the `articles` content collection (`src/content/articles/*.mdx`, schema in `src/content.config.ts`) and are rendered by `src/pages/blog/[slug].astro`. Don't add standalone pages to that collection, and don't spin up a new collection for a one-off page.

## 🧪 Verification before committing

Two easy things that catch almost every regression:

1. **Grep for what you removed.** If your change is supposed to delete a token, class, or symbol, grep for it under `src/` before committing. Don't trust the diff alone — it only shows what changed in this session, not what's still referenced elsewhere.
2. **`pnpm build`** must succeed. Run it before pushing.

We also have Prettier configured. Run `pnpm format` if you've touched files; Prettier is the source of truth for whitespace/quotes/line-length.

## 🎯 Scope discipline

- **Do only what was asked.** A bug fix is not a refactor. A feature request for X doesn't mean building Y and Z on speculation. If you think something adjacent needs work, flag it at the end of your response instead of shipping it.
- **Don't pre-build primitives** (forms, modals, etc.) until a concrete use case lands. We've deleted speculative primitives before.
- **Don't add code comments that narrate the code.** The code narrates itself. Comments are for non-obvious _why_ (invariants, workarounds, subtle constraints) — not _what_.

## ✍️ Tone

- **Prose** (README, PR descriptions, contributor docs) — a tasteful emoji per section header is welcome. This repo has a warm voice.
- **Code and code comments** — no emojis.
- **Commit messages** — short imperative subject (under 70 chars), blank line, body that explains the _why_.

## 🧱 Architecture reminders

- File-based routing: `src/pages/foo.md` → `/foo`. Don't invent routing indirection.
- Layouts (`src/layouts/Layout.astro`) wrap pages via `<slot />`. Everything global (font loading, global stylesheet import) goes there, not in individual pages.
- `src/assets/` for media processed by Astro's pipeline; `public/` for files served as-is.
- Build output is fully static — do not introduce a server runtime without discussion.

## 🔗 Related

- [README.md](./README.md) — human-facing setup, structure, and styling docs
- [/style-guide](http://localhost:4321/style-guide) (dev) — live reference for tokens and primitives
- [Astro docs](https://docs.astro.build)
