# Agent guide

This is a Bun + Turborepo monorepo. The focus is **UI only**: don't connect the UI to a backend.

## Read before building UI

1. [docs/design-system/README.md](docs/design-system/README.md): philosophy, layers and the list of systems.
2. [docs/design-system/conventions.md](docs/design-system/conventions.md): styling, tokens, where code goes, and how to add a system.
3. The page for the system you're touching, in `docs/design-system/systems/`.

Product context lives in `vtu_developer_infrastructure_vscode/docs/`. Write copy from the PRD, not from the homepage brief; see "Content principles" in the design-system README.

## Rules

- **Build systems, not one-offs.** Model content as typed config, render it with a reusable system in `packages/ui`, and keep the app's copy in `apps/web/src/config`.
- **shadcn/ui is the base.** Add primitives with `bunx --bun shadcn@latest add <name>`, run inside `packages/ui`. Don't hand-edit primitives except through tokens.
- **Tailwind only.** No new CSS files. Tokens live in `packages/ui/src/styles/globals.css`.
- **No `next/*` imports in `packages/ui`.** Use `SmartLink` and `SmartImage` from `@rektinasub/ui/components/adapters`.
- **Honest UI.** Any link to a page that doesn't exist yet must be `status: "planned"`.
- **Media goes through the registry.** Register images in `apps/web/src/config/media.ts`. Unsplash placeholders are fine until real assets arrive.
- **Keep the docs current.** When you add or change a system, update its page under `docs/design-system/systems/` in the same change.

## Commands (from the repo root)

`bun dev`, `bun run typecheck`, `bun run lint`, `bun run build`, `bun run format`
