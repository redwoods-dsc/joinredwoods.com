# Member stands

Drawings shown in place of a profile picture, for members who have none in Slack
(neither an upload nor a Gravatar). Nobody listed needs one today, but the next
person to opt in without a photo will.

Drop numbered files in here — `01.png`, `02.png`, and so on. Any number works:
`MemberCard` sorts the folder by filename and picks one per member. Empty the
folder and the photo falls back to a plain green ground rather than breaking.

Which drawing a member gets is keyed off their slug, not their position in the
list, so it stays the same when somebody new joins partway up the alphabet.

What they need to be:

- **Square, with the subject centred.** The card draws the photo as a 128px
  square where it has room, but on narrow cards it is a strip 64–96px wide and
  as tall as the card, cropped to fill. Only the middle of the drawing is
  certain to show.
- **192px or larger.** Astro renders them at 192px, and sharp will not enlarge
  a smaller source.
- Either grounded in `--color-surface` themselves, as `01.png` is, or transparent
  — the card paints that same green behind them either way.
- In the same hand as `trees-04.png` and the rest of the site's artwork.

`01.png` is a stand-in rather than a drawing of its own: a square lifted out of
`trees-04.png`, its luminance remapped from the accent it was flattened onto to
this green. It works at card size, but it is the header artwork wearing a
different colour, and ten of those would be one drawing ten times.
