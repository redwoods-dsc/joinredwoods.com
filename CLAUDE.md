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
- **Do not create a shared `components.css`.** Component styles live in the component's own `<style>` block (see below). We've had to rip this out once already — don't re-introduce it.

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

- File-based routing: `src/pages/foo.astro` → `/foo`. Don't invent routing indirection.
- Layouts (`src/layouts/Layout.astro`) wrap pages via `<slot />`. Everything global (font loading, global stylesheet import) goes there, not in individual pages.
- `src/assets/` for media processed by Astro's pipeline; `public/` for files served as-is.
- Build output is fully static — do not introduce a server runtime without discussion.

## 🔗 Related

- [README.md](./README.md) — human-facing setup, structure, and styling docs
- [/style-guide](http://localhost:4321/style-guide) (dev) — live reference for tokens and primitives
- [Astro docs](https://docs.astro.build)
