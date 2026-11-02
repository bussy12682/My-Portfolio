# Conventions

## Styling

- Use Tailwind utilities only. Don't add `.css` files or CSS modules.
- Use token classes (`bg-background`, `text-muted-foreground`, `border`, `text-orbital`, `ring-ring`), never raw hex values or Tailwind palette colours like `bg-zinc-900`.
- Motion comes from `@rektinasub/ui/components/motion` and `lib/motion`. See [systems/motion.md](systems/motion.md).
- Merge classes with `cn()`, which comes from `cn` inside `packages/ui` and from `@rektinasub/ui/lib/utils` in apps.
- Take text sizes from `typeScale` (`@rektinasub/ui/components/typography`). They are measured from the design reference. Headings are semibold with tight tracking.
- Buttons are 40px: `default` (header, 15px) and `lg` (page, 16px). `sm` is 36px. Don't hand-size buttons.
- Before adding a new size or gap, measure the reference (see [design-reference.md](design-reference.md)). Don't guess.
- Express variants with `cva` (see `headerVariants` in `navigation-header.tsx`). Don't build conditional class strings by hand.
- `globals.css` is the only stylesheet. Change it only to add or adjust tokens.

## Tokens

Tokens are defined in `packages/ui/src/styles/globals.css`: `:root, .light` for light, `.dark` for dark. The site renders dark (`dark` on `<html>`).

| Token                                      | Use                                                       |
| ------------------------------------------ | --------------------------------------------------------- |
| `background` / `foreground`                | Page surface and text                                     |
| `muted-foreground`                         | Secondary text, footer links                              |
| `border`                                   | Hairlines and separators                                  |
| `orbital` / `orbital-foreground`           | The brand blue as an accent: +/− marks, chips, highlights |
| `primary`                                  | Main CTA, always blue (#116FF8)                           |
| `card`                                     | Panels (#151515), announcement bar, inset notes           |
| `subtle`                                   | The black closing band                                    |
| `muted`                                    | Tool tiles on dark; the stage fill on light               |
| `secondary`                                | Neutral chips                                             |
| `ring`                                     | Focus outline (set to `orbital`)                          |
| `font-sans` / `font-heading` / `font-mono` | Host Grotesk; Geist Mono for code and IDs only            |

### Surfaces

The site is dark. To show a light region inside it, such as a product screen, add the `light` class (`Stage` does this). Every token inside switches back to the light set:

```tsx
<Stage className="aspect-[4/3]">…</Stage>
```

Put borders that separate a light region from the dark page on a wrapper, not on the light element itself, or they take the light border colour.

## Where code goes

| You are building…                               | Put it in                                                                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A shadcn primitive                              | `bunx --bun shadcn@latest add <name>`, run in `packages/ui` (it lands in `components/ui`) |
| A reusable system (navigation, footer, hero, …) | `packages/ui/src/components/<system>/`                                                    |
| App content (links, copy, media)                | `apps/web/src/config/`                                                                    |
| Wiring a system to app content and brand        | `apps/web/src/components/site/`                                                           |
| Something only one page uses                    | Next to that page's route                                                                 |

## Anatomy of a system

```text
packages/ui/src/components/<system>/
  types.ts         the config model (the system's public contract)
  <system>.tsx     the entry component (layout plus variants)
  <part>.tsx       one file per sub-part (desktop, mobile, panel, ...)
  index.ts         the public API: re-export the entry component and types only
```

To add a new system:

1. Write `types.ts` first. It's the contract apps fill in.
2. Compose shadcn primitives. Add missing primitives with the shadcn CLI.
3. Add a `"./components/<system>"` entry to `exports` in `packages/ui/package.json`.
4. Add the config in `apps/web/src/config/<system>.ts` and a composition in `apps/web/src/components/site/`.
5. Document it in `docs/design-system/systems/<system>.md` and list it in the README table.

## Links and availability

- Every link is a `LinkItem` (`@rektinasub/ui/lib/links`): `label`, `href`, an optional `description`, `external`, and `status`.
- `status: "planned"` means the page doesn't exist yet. Systems hide planned links unless `showPlanned` is set.
- Apps pass `showPlanned={siteConfig.showPlannedLinks}`, which is true in development and false in production, so production builds never ship dead links. When a page ships, change its `status` (or delete the field).

## Framework adapters

Systems never import `next/*`. Instead they render `SmartLink` and `SmartImage`, and read the current path from `useAdapters()`. The app supplies the real implementations once, in `apps/web/src/components/providers/ui-adapters-provider.tsx`. This keeps `packages/ui` portable to any app in the monorepo.

## Client and server components

- Systems with interaction are `"use client"`.
- Config containing icon components (Lucide) can't be passed from a server component to a client component. So compositions that import such config, like `site-header.tsx`, are client components themselves.

## Media

- Register every image and video in `apps/web/src/config/media.ts` as `{ src, alt, placeholder }`, and reference it by key.
- Until final assets arrive, use placeholders: Unsplash images that match the context (orbit, connectivity, phones, developer workspaces). Allow any new host in `next.config.ts` under `images.remotePatterns`.
- Always write a real `alt` text.

## Accessibility

- Rely on the Base UI primitives for keyboard and focus behaviour. Don't replace them with divs.
- Every `nav` gets an `aria-label`. Icon-only buttons get an `aria-label`.
- Never remove the focus ring. It uses the `ring` token.
