# Footer system

**Entry:** `@rektinasub/ui/components/footer`
**Source:** `packages/ui/src/components/footer/`
**App config:** `apps/web/src/config/footer.ts`
**Composition:** `apps/web/src/components/site/site-footer.tsx`

## What it is

A data-driven site footer, measured from the design reference:

1. **Top:** the brand and a 20px tagline, closed by a hairline.
2. **Main:** on the left half, a 32px statement and labelled contact links (planned ones hidden). On the right half, link columns with 12px uppercase heads and 15px links on a 32px pitch (Personal, Developers and Company today).
3. **Bottom bar:** the copyright and the secondary groups (Legal) as inline 12px uppercase links.

## Config model

```ts
type FooterConfig = {
  groups: { title: string; links: LinkItem[] }[];
  secondaryGroups?: { title: string; links: LinkItem[] }[];
  tagline?: string;
  statement?: string;
  contacts?: { label: string; link: LinkItem }[];
  copyright: string;
};
```

## Props

| Prop          | Default    | Notes                   |
| ------------- | ---------- | ----------------------- |
| `config`      | (required) | `FooterConfig`          |
| `brand`       | (required) | Brand slot              |
| `showPlanned` | `false`    | Same rule as navigation |

## Rules

- Show only links whose destinations exist. Planned links are hidden in production automatically.
- List only products that are in the current release. The SMS API stays out until it ships.
- Add API Documentation and Service Status as `planned` now, and mark them live when those pages ship.
- The Acceptable Use Policy wording needs legal review before launch.

## Extending it

- **More columns:** add groups. The grid gives each group an equal column.
- **Newsletter, social links or a language switcher:** add an optional field to `FooterConfig` and a slot in `footer.tsx`, then document it here.
