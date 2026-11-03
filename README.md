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

### Enabling the Permitt backend

The account forms and developer dashboard use the Next.js API routes in `apps/web`.
Before they can access real accounts or money, apply
[`supabase/migrations/202611030001_permitt_backend.sql`](./supabase/migrations/202611030001_permitt_backend.sql)
to the Supabase project and set the variables from [`.env.example`](./.env.example)
in the Vercel project's Production (and Preview, if needed) environment:

- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, and `EMAIL_PRICE_KOBO`
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_MIN_TOPUP_NGN`, and `PAYSTACK_MAX_TOPUP_NGN`

`EMAIL_DAILY_LIMIT` and `SENDGRID_FROM_NAME` are optional and have defaults. Keep
service-role and provider secrets server-side; do not use a `NEXT_PUBLIC_` prefix
for them.

For local development, put the values in `apps/web/.env.local`. In Supabase's
Authentication URL configuration, allow the callback URL above. Set the
confirmation email template's action link to
`{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup` so the
server callback can verify the token hash. Verify the sender address in SendGrid
and configure the Paystack webhook URL as
`${NEXT_PUBLIC_SITE_URL}/api/billing/paystack/webhook`.

The dashboard supports account sign-in/up, project and API-key management,
Paystack top-ups, wallet balance, and recent email activity. Email sends are made
by calling `POST /api/v1/emails` with a project API key and an `Idempotency-Key`
header. The API key secret is only shown at creation; store it securely on your
application server, never in browser code.

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
