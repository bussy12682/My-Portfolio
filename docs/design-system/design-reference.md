# Design reference

The visual reference is **designme.agency**. Screenshots are in `apps/web/design-ref/www.designme.agency_*.png`. The older `scale.com_*.png` screenshots are superseded; don't follow them.

The screenshots are 3× captures of a roughly 1500px-wide viewport, so CSS px = image px ÷ 3. Every number below was **measured** from them with a pixel script, then converted for Host Grotesk (cap height 0.72em) so cap heights match. Re-measure rather than eyeball when you add something new.

Follow the reference's **system** (type, spacing, controls, surfaces, section patterns). Don't copy its brand, logos, client names, testimonials, stats or imagery. Where the reference relies on social proof we don't have, we show verifiable product facts or product screens instead.

## Type (`typeScale`, `@rektinasub/ui/components/typography`)

| Role                            | Reference measurement               | Ours                                                   |
| ------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| Hero headline (`display`)       | cap 57px, line pitch 78.6px         | 80px / 0.98, semibold, −0.04em                         |
| Closing headline (`closing`)    | cap 53px                            | 74px / 1.05                                            |
| Section headline (`title`)      | cap 41px, pitch 64px                | 58px / 1.1                                             |
| Numbered row (`row`)            | cap 31px                            | 43px / 1                                               |
| Panel and statement (`heading`) | cap 23px                            | 32px / 1.15                                            |
| Card title (`subtitle`)         | pitch 26.4px                        | 20–22px / 1.2–1.3                                      |
| Lead (`lead`)                   | pitch 27.4px                        | 18px / 1.5                                             |
| Emphasised paragraph (`strong`) | pitch 25px                          | 19px semibold / 1.3                                    |
| List (`list`)                   | pitch 28px                          | 16px / 28px                                            |
| Body (`body`)                   | pitch 23.5px                        | 16px / 1.47, muted                                     |
| Eyebrow                         | cap 8.7px                           | 12px medium, uppercase, 0.08em tracking, no decoration |
| Nav                             | cap 11px                            | 15px medium                                            |
| Text link                       | cap 11px, rule 2–4px under the text | 15px semibold, 1px underline at 5px offset, arrow      |

## Controls

- **Buttons** are 40px tall with square (3px) corners. Use the header size (`default`, 15px text, 16px padding) or the page size (`lg`, 16px text, 24px padding). The first action is blue (`default`), and the next is white (`contrast`), 8px apart.
- **Open/close mark** (`DisclosureMark`): a 32px blue plus with a 2.7px stroke, drawn from two bars, which collapses to a minus when open (20px with a 2px stroke in the FAQ).
- **Chips** are 26px tall and square, with the accent chip blue-tinted.

## Surfaces and colour

| Reference                            | Token                               |
| ------------------------------------ | ----------------------------------- |
| Page #0F0F0F                         | `background` (`.dark`)              |
| Panels #151515, announcement #171717 | `card`                              |
| Closing band #000                    | `subtle` (`.dark`)                  |
| Blue #116FF8                         | `primary` and `orbital`             |
| Light screen panels                  | `Stage` (light tokens via `.light`) |

The whole site is dark (`dark` on `<html>`). Product screens sit on light `Stage` panels, the way the reference shows case-study screens.

## Layout rhythm (at a 1500px viewport)

- **Chrome:** the announcement bar is 32px and the header 75px with a hairline. The nav is centred and the CTA is on the right.
- **Hero:** eyebrow cap to headline cap is 43px. Headline baseline to lead is 31px, lead to buttons 35px, and buttons to stats 52px. The aside is about 29% wide (416px), top-aligned with the eyebrow.
- **Cell strip:** 72px cells between full-bleed hairlines, with dividers aligned to the container.
- **Service rows:** a 97px pitch, with the title column 136px in. An open row has a 4:3 stage at 50% − 16px, and the text column starts exactly at 50%.
- **Paired panels:** 440px tall, split 11:9, 20px apart.
- **Story cards:** 1px border, 32px padding, split 46/54. The inset note sits on `card`.
- **Footer:** a 20px tagline, then a hairline. A 32px statement and contact links sit on the left half, and the link columns (12px heads, 15px links on a 32px pitch) on the right half. A 12px uppercase bottom bar closes it.

Container width is **1450px** (a project decision; the reference uses 1200px at this viewport).

## Primitive changes made for the reference

`packages/ui/src/components/ui/button.tsx` (shadcn):

- The base is `rounded-md font-medium`. `bg-clip-padding` is removed so the fill reaches the full 40px.
- There's a new `contrast` variant, and `outline` is transparent.
- The sizes match the measurements above.

Keep these when re-running the shadcn CLI for `button`.
