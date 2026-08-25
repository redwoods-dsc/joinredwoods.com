interface Slots {
  has(name: string): boolean;
  render(name: string): Promise<string>;
}

/**
 * Render a slot as phrasing content, dropping the paragraph MDX may have put
 * around it.
 *
 * MDX parses a component's children as *block* content whenever they sit on
 * lines of their own, and as *inline* content when they share a line with the
 * tags. Block content means every line becomes a Markdown paragraph, so
 * `<Button>Join</Button>` yields `<a>Join</a>` while the same call wrapped
 * across three lines yields `<a><p>Join</p></a>`.
 *
 * Which one an author gets is decided by where Prettier chose to wrap, not by
 * anything they wrote. Inside an element whose content model is phrasing only —
 * a heading, a button — the paragraph is invalid markup, and it drags
 * `base.css`'s prose measure and `text-wrap` along with it. Components that
 * render such an element call this instead of `<slot />` so the source can be
 * formatted however Prettier likes.
 *
 * Only a single wrapping paragraph is removed. Genuinely multi-paragraph
 * content is returned untouched — it has no business in a heading or a button,
 * and silently welding it into one line would hide the mistake rather than
 * surface it.
 */
export async function inlineSlot(slots: Slots, name = 'default'): Promise<string> {
  if (!slots.has(name)) return '';

  const html = (await slots.render(name)).trim();
  const inner = /^<p>([\s\S]*)<\/p>$/.exec(html)?.[1];

  return inner !== undefined && !inner.includes('</p>') ? inner : html;
}
