# Member stands

Drawings shown in place of a profile picture, for the members who have never set
one in Slack. Five of them today.

Drop numbered files in here — `01.png`, `02.png`, and so on. Ten is the number
we planned for, but any number works: `MemberCard` sorts the folder by filename
and picks one per member. Empty the folder and the circle falls back to a plain
green ground rather than breaking.

Which drawing a member gets is keyed off their slug, not their position in the
list, so it stays the same when somebody new joins partway up the alphabet.

What they need to be:

- **Transparent PNG.** They sit on `--color-surface`, the green, which the card
  paints behind them.
- **Square**, and legible at **64px** — they are drawn into a circle, so keep the
  subject clear of the corners.
- **256px or larger.** Astro renders them at 128px for 2× screens, and sharp
  will not enlarge a smaller source.
- In the same hand as `trees-04.png` and the rest of the site's artwork.
