# Navigation system

**Entry:** `@rektinasub/ui/components/navigation`
**Source:** `packages/ui/src/components/navigation/`
**App config:** `apps/web/src/config/navigation.ts`
**Composition:** `apps/web/src/components/site/site-header.tsx`

## What it is

A global header built from one `NavigationConfig`. The same data renders as:

- **Desktop** (`lg` and up): a shadcn `NavigationMenu` with dropdowns and mega panels.
- **Mobile** (below `lg`): a `Sheet` drawer with an `Accordion` per menu, plus the actions pinned to the bottom.

## Config model

```ts
type NavigationConfig = { items: NavItem[]; actions?: NavAction[] };

type NavItem =
  | { type: "link"; label; href; status? } // direct link
  | { type: "group"; label; items: NavLink[] } // simple dropdown
  | { type: "mega"; label; sections: { title; items: NavLink[] }[]; featured? }; // mega menu

type NavLink = LinkItem & { icon?: LucideIcon }; // description shows in panels
type NavAction = LinkItem & { variant?: "default" | "outline" | "ghost" };
```

`featured` is an optional promo card on the right of a mega panel: `eyebrow`, `label`, `description`, `href` and an `image` taken from the media registry.

## Props

| Prop          | Default    | Notes                                                 |
| ------------- | ---------- | ----------------------------------------------------- |
| `config`      | (required) | `NavigationConfig`                                    |
| `brand`       | (required) | Brand slot, usually `<Wordmark />`, which links home  |
| `showPlanned` | `false`    | Keeps `planned` links (shown normally, with no badge) |

## Behaviour

- Planned links are filtered first, and any menu left empty disappears.
- The active state comes from `isActivePath(pathname, href)`: exact match for `/`, prefix match for sections.
- Links and actions render through `SmartLink`, so they use the app's router. External links open in a new tab.
- The mobile drawer closes when a link is chosen.

## Extending it

- **New top-level entry:** add an item to the config. No code change is needed.
- **New menu shape** (for example, a tabbed mega menu): add a member to the `NavItem` union in `types.ts`, a branch in `prepare.ts`, a renderer in `navigation-desktop.tsx`, and an accordion branch in `navigation-mobile.tsx`. Then document it here.
- **Different header for another app** (for example, a Permitt dashboard): reuse `NavigationHeader` with that app's config and `<Wordmark brand="permitt" />`.

## Current content

**Personal** (Airtime, Data) is a group. **Developers** is a mega menu with Products (Email API, Usage & keys) and Resources (Developer Platform, API Documentation, Service Status), plus a Permitt featured card. **Pricing** is a link and **Company** is a group. The actions are **Sign in** and **Get Started**.

All of them are `planned` until their pages exist.
