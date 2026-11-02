# Section systems

Pages are assembled from these systems. Each is its own entry under `@rektinasub/ui/components/*`. Copy lives in `apps/web/src/config/`: `home.ts`, `pages/*.ts` and `links.ts`. Measurements are in [../design-reference.md](../design-reference.md).

## Foundations

| Export                                          | Entry        | Purpose                                                                                                                                       |
| ----------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`                                     | `layout`     | The horizontal rhythm: `max-w-[1450px]`, with `px-5 sm:px-8 lg:px-10`. The header and announcement bar use the same width.                    |
| `Section`                                       | `layout`     | Vertical rhythm (`py-20 sm:py-24 lg:py-30`) plus a `Container`. `surface` is `default` or `subtle` (the near-black band).                     |
| `SectionHeader`                                 | `layout`     | Eyebrow, 58px title (`\n` for line breaks) and an 18px lead. Centred by default; `align="start"` for side-by-side layouts. Reveals on scroll. |
| `typeScale`, `Eyebrow`                          | `typography` | The measured type scale. Never use ad-hoc sizes.                                                                                              |
| `Actions`, `ActionButton`, `TextLink`           | `actions`    | Button rows (blue, then white) and the underlined arrow link. All hide planned links.                                                         |
| `Stage`                                         | `showcase`   | Light panel for product screens, with light tokens inside the dark page.                                                                      |
| `Window`, `StatusPill`, `Timeline`, `CodeBlock` | `showcase`   | Parts for drawing product screens.                                                                                                            |
| `DisclosureMark`                                | `disclosure` | The blue +/− mark. It reacts to `aria-expanded` on a `group/disclosure` parent.                                                               |
| `SmoothScroll`, `Reveal`, `Parallax`            | `motion`     | See [motion.md](motion.md).                                                                                                                   |
| `enter()`                                       | `lib/motion` | CSS entrance classes for above-the-fold content.                                                                                              |

## Systems

| System            | Entry            | Content model                                                                                            | Notes                                                                           |
| ----------------- | ---------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `AnnouncementBar` | `announcement`   | `message`, `badge?`, `link?`                                                                             | 32px strip with a white chip. The whole message is the link when it's live.     |
| `Hero`            | `hero`           | `eyebrow?`, `title`, `description?`, `actions?`, `stats?`, `aside?`                                      | 80px headline. `stats` is the bold-figure row.                                  |
| `HeroShowcase`    | `hero`           | `slides[]` (`name`, `detail?`, `visual`), `label?`, `link?`, `interval?`                                 | The hero aside: a light stage cycling product screens, with segmented progress. |
| `CellStrip`       | `cell-strip`     | `CellItem[]` (`label`, `icon?`)                                                                          | 72px cells between hairlines. Scrolls sideways on mobile.                       |
| `ServiceList`     | `service-list`   | `ServiceItem[]` (`id`, `title`, `summary`, `points?`, `link?`, `visual?`)                                | Numbered rows, one open at a time. An open row shows a 4:3 stage plus details.  |
| `FeaturePanels`   | `feature-panels` | two `FeaturePanel`s (`eyebrow?`, `title`, `description`, `link?`, `icons?`, `iconStyle?`, `glow?`)       | Centred #151515 panels, split 11:9.                                             |
| `StoryCard`       | `story-card`     | `name`, `tags?`, `meta?`, `title`, `description`, `link?`, `note?`, `visual`, `reverse?`                 | Bordered split card with an inset note. The visual zooms slightly on hover.     |
| `StepList`        | `step-list`      | `StepItem[]` (`title`, `description`)                                                                    | Static numbered rows for sequences and principles.                              |
| `PlanCards`       | `plan-cards`     | `PlanCard[]` (`eyebrow`, `name`, `description`, `price`, `priceNote?`, `points`, `action?`, `featured?`) | Pricing columns. `price` is a model ("Listed price"), never an invented number. |
| `Faq`             | `faq`            | `FaqItem[]`                                                                                              | Hairline rows, several open at once.                                            |
| `CtaBand`         | `cta-band`       | `eyebrow?`, `title`, `description?`, `actions`                                                           | Black closing band with a rising blue glow (parallax).                          |
| `AuthForm`        | `auth-form`      | `title`, `fields[]`, `submitLabel`, `pendingMessage`, `switchPrompt?`                                    | UI only. On submit it shows `pendingMessage` and never pretends to work.        |

## Product screens

App-specific screens live in `apps/web/src/components/site/previews.tsx`:

- `ReceiptScreen`
- `PlanScreen`
- `AirtimeScreen`
- `EmailScreen`
- `EventsScreen`
- `UsageScreen`
- `DomainsScreen`

`StageScreen` places a screen on a stage, centred and cropped at the bottom, with an optional `scale` and a slight parallax. The data for each screen is in config and is illustrative.

## Pages

| Route                   | Composition                                                                   |
| ----------------------- | ----------------------------------------------------------------------------- |
| `/`                     | Hero + showcase → strip → services → panels → two story cards → FAQ → closing |
| `/airtime`, `/data`     | `PageHero` → `StepsSection` → story card → `FaqSection` → `ClosingBand`       |
| `/developers`           | `PageHero` → services → steps → story card → FAQ → closing                    |
| `/developers/email-api` | `PageHero` → quickstart steps → two story cards → FAQ → closing               |
| `/pricing`              | `PageHero` → `PlanCards` → FAQ → closing                                      |
| `/about`                | `PageHero` → principles (`StepList`) → panels → closing                       |
| `/sign-in`, `/sign-up`  | `(auth)` layout: form left, receipt screen on a stage right                   |

`PageHero`, `StepsSection`, `FaqSection` and `ClosingBand` are in `apps/web/src/components/site/page-sections.tsx`, so every interior page shares one rhythm.

Not built yet (links stay `planned`): `/docs`, `/status`, `/contact`, `/developers/usage` and `/legal/*`. They need real API docs, live status data, real contact details or legal text. Don't fake them.

## Adding a section system

Use a section system only when a pattern will repeat. One-off layouts belong in the page, composed from `Section` and `SectionHeader`. Then follow "Anatomy of a system" in [../conventions.md](../conventions.md).
