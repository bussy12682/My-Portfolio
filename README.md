# Rektina.sub

Monorepo for Rektina.sub: consumer VTU services (airtime, data) and developer messaging APIs.

It uses Bun workspaces and Turborepo.

## Layout

```text
apps/
  web/                    Next.js app (App Router, Tailwind CSS v4, shadcn/ui)
packages/
  ui/                     Shared shadcn/ui components, theme and Tailwind entry CSS
  eslint-config/          Shared ESLint flat configs (base, next, react-library)
  typescript-config/      Shared tsconfig presets (base, nextjs, react-library)
vtu_developer_infrastructure_vscode/
                          Product docs (PRD, SRS, architecture, API) and the original Vite prototype
```

## Getting started

Requires [Bun](https://bun.sh) 1.3 or newer.

```bash
bun install
bun dev          # every app's dev server (web on http://localhost:3000)
```

## Scripts (run from the root)

| Command             | What it does                        |
| ------------------- | ----------------------------------- |
| `bun dev`           | Start dev servers via Turborepo     |
| `bun run build`     | Build every workspace               |
| `bun run lint`      | ESLint across workspaces            |
| `bun run typecheck` | `tsc --noEmit` across workspaces    |
| `bun run format`    | Prettier (with Tailwind class sort) |

To run a task in one workspace, use `bunx turbo run dev --filter=@rektinasub/web`.

## Vercel deployment

The web app is in `apps/web`. Configure the Vercel project's Root Directory as
`apps/web` and enable **Include source files outside of the Root Directory** so the
shared workspace packages are available during install and build. Deployment
commands are in `apps/web/vercel.json`.

## Adding UI components

From `apps/web`, run:

```bash
bunx --bun shadcn@latest add dialog
```

The CLI writes components into `packages/ui/src/components`. Import them like this:

```tsx
import { Button } from "@rektinasub/ui/components/button";
```

## Adding a workspace

Create a folder under `apps/` (deployable apps such as an API or a worker) or under `packages/` (shared libraries). Name the package `@rektinasub/<name>`, and depend on other workspaces with `"workspace:*"`.
