# REKTINA design system

How the UI is built, for anyone (human or AI agent) who adds to it. Read this first, then [conventions.md](conventions.md). For the visual language (designme.agency, measured from the screenshots in `apps/web/design-ref/`), see [design-reference.md](design-reference.md). For motion, see [systems/motion.md](systems/motion.md). Each system has its own page under [systems/](systems/).

## Philosophy

1. **Systems, not one-offs.** We never build "a navbar". We build the _navigation system_: a data model, renderers for each shape (link, dropdown, mega menu), desktop and mobile layouts, and one place where apps describe their content. Growing the UI should mean adding config or a new variant, not rewriting components.
2. **shadcn/ui is the base.** Every interactive primitive comes from shadcn (`packages/ui/src/components/ui`). Systems compose primitives. We don't fork primitives to restyle them; we theme them through tokens.
3. **Tailwind only.** Styling is Tailwind utilities on design tokens. Plain CSS is allowed only in `packages/ui/src/styles/globals.css`, and only for tokens or what utilities cannot express.
4. **Content is data.** Apps keep links, labels and media in `src/config/*`. Systems never hard-code copy.
5. **Brand-agnostic systems, branded apps.** `packages/ui` knows nothing about REKTINA.sub or Permitt. Apps pass the brand in through slots (for example, `brand={<Wordmark />}`).
6. **Honest UI.** Don't link to pages that don't exist, and don't claim features that aren't live. Links carry a `status`, and systems enforce it.

## Content principles

The homepage brief's copy is **not** the source of truth. Don't reuse it. Write copy from what the product actually does, as described in `vtu_developer_infrastructure_vscode/docs/01-prd.md`.

- **Specific beats generic.** Say "the final price, before you pay", not "effortless connectivity".
- **Only real promises.** Don't claim "cheapest", don't promise inbox placement, and don't sell the SMS API before it ships.
- **Plain language.** Avoid slang ("highkey", "lowkey") and capitalised slogans. Headlines are sentence case and end with a full stop.
- **Two audiences, one account.** Address consumers as REKTINA.sub and developers as Permitt, and say plainly which one each section is for.

## Layers

```text
tokens        packages/ui/src/styles/globals.css         colours, radius, fonts, surfaces
primitives    packages/ui/src/components/ui/*            shadcn, CLI-managed
foundations   packages/ui/src/components/{adapters,layout,typography,actions,showcase,disclosure,motion}, src/lib/*
systems       packages/ui/src/components/<system>/       navigation, footer, ...
composition   apps/<app>/src/components/site/*           system + app config + brand
content       apps/<app>/src/config/*                    links, copy, media registry
pages         apps/<app>/src/app/**                      routes assemble compositions and sections
```

A layer may import only from layers above it in this list.

## Brand direction

- A dark site: #0F0F0F canvas, #151515 panels, a black closing band. **Blue (#116FF8)** is the only accent: primary buttons, open/close marks, focus and small highlights.
- Square edges (3px), hairline borders, big semibold type with tight tracking. No glows on cards, no pills with dots, no decorative gradients beyond the closing band.
- Two identities: **REKTINA.sub** (consumer) and **Permitt by REKTINA** (developer). Keep the two experiences visibly distinct.
- Show the product: drawn receipts, plan pickers and API calls on light `Stage` panels, never stock photos. Replace social proof we don't have with verifiable product facts.

## Systems

| System                                                                                                                              | Package entry                          | Doc                                            |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------- |
| Navigation                                                                                                                          | `@rektinasub/ui/components/navigation` | [systems/navigation.md](systems/navigation.md) |
| Footer                                                                                                                              | `@rektinasub/ui/components/footer`     | [systems/footer.md](systems/footer.md)         |
| Sections: announcement, hero, cell-strip, service-list, feature-panels, story-card, step-list, plan-cards, faq, cta-band, auth-form | `@rektinasub/ui/components/<name>`     | [systems/sections.md](systems/sections.md)     |
| Motion: smooth scroll, reveal, parallax                                                                                             | `@rektinasub/ui/components/motion`     | [systems/motion.md](systems/motion.md)         |

Foundations used by every system:

- `@rektinasub/ui/components/adapters`: framework adapters (`SmartLink`, `SmartImage`), see conventions.
- `@rektinasub/ui/components/layout`: `Container`, `Section` and `SectionHeader`, the horizontal and vertical rhythm.
- `@rektinasub/ui/components/typography`: `typeScale` and `Eyebrow`.
- `@rektinasub/ui/components/actions`: `Actions`, `ActionButton` and `TextLink`.
- `@rektinasub/ui/components/showcase`: `Stage`, `Window`, `StatusPill`, `Timeline` and `CodeBlock` for product screens.
- `@rektinasub/ui/lib/links`: `LinkItem`, `ActionLink`, `visibleLinks`, `isActivePath`.
- `@rektinasub/ui/lib/media`: `MediaItem`.

## Open decisions

- **Logo:** we need a transparent SVG with the satellite symbol. Until then, `apps/web/src/components/brand/wordmark.tsx` renders a typographic placeholder.
- **Typeface:** Host Grotesk (sans and headings, via `next/font` in `apps/web/src/app/layout.tsx`). Geist Mono is used only for code and IDs inside product screens.
- **Prices:** developer pricing isn't set (the PRD sets it after provider selection). The Pricing page says so; don't add numbers until they're real.
- **Media:** all images are Unsplash placeholders listed in `apps/web/src/config/media.ts`.
