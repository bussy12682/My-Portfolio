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
Create a Neon database and apply
[`neon/migrations/202611110001_initial_backend.sql`](./neon/migrations/202611110001_initial_backend.sql)
and then
[`neon/migrations/202611110002_vtu_purchases.sql`](./neon/migrations/202611110002_vtu_purchases.sql)
and
[`neon/migrations/202611130001_paymentpoint_wallet_deposits.sql`](./neon/migrations/202611130001_paymentpoint_wallet_deposits.sql)
to it using Neon SQL Editor or `psql`. Set the variables from
[`.env.example`](./.env.example) in the Vercel project's Production environment.
The example file contains placeholders only; enter actual values directly into
Vercel's encrypted Environment Variables settings and never commit credentials:

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `EMAIL_PRICE_KOBO`
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_MIN_TOPUP_NGN`, and `PAYSTACK_MAX_TOPUP_NGN`
- `PAYMENTPOINT_API_KEY`, `PAYMENTPOINT_SECRET_KEY`, and `PAYMENTPOINT_BUSINESS_ID`
- `TELECOM_ABODE_API_KEY` for live airtime and data purchases

`EMAIL_DAILY_LIMIT` and `RESEND_FROM_NAME` are optional and have defaults. Verify
the sender domain in Resend before sending; `RESEND_FROM_EMAIL` must use that
verified domain, not a personal Gmail address. Keep all credentials server-side;
do not use a `NEXT_PUBLIC_` prefix for secrets.

The support email shown in the site navigation and footer is
`rktsub.support@gmail.com`.

For local development, put the values in `apps/web/.env.local`. Resend sends
account verification, password reset and developer email messages. Configure
the Paystack webhook URL as
`${NEXT_PUBLIC_SITE_URL}/api/billing/paystack/webhook`.
For wallet bank-transfer deposits, configure PaymentPoint's webhook URL as
`${NEXT_PUBLIC_SITE_URL}/api/billing/paymentpoint/webhook`.

#### Production go-live checklist

1. In Vercel, add the production values for `NEXT_PUBLIC_SITE_URL`
   (`https://rektina-sub-web.vercel.app`), `DATABASE_URL`, `RESEND_API_KEY`,
   `RESEND_FROM_EMAIL`, `EMAIL_PRICE_KOBO`, `PAYSTACK_SECRET_KEY`,
   `PAYMENTPOINT_API_KEY`, `PAYMENTPOINT_SECRET_KEY`,
   `PAYMENTPOINT_BUSINESS_ID`, and `TELECOM_ABODE_API_KEY`. Set the Paystack
   top-up limits too, and optionally
   `EMAIL_DAILY_LIMIT` and `RESEND_FROM_NAME`. Redeploy after changing variables.
2. In Neon SQL Editor, apply migration `202611110001_initial_backend.sql`,
   followed by `202611110002_vtu_purchases.sql` and
   `202611130001_paymentpoint_wallet_deposits.sql`. These migrations create a
   new schema; they do not import existing Supabase accounts or data.
3. Verify the sender domain in Resend and use an address at that verified domain
   for `RESEND_FROM_EMAIL`. Send a verification email to an account you control.
4. Configure Paystack's webhook URL to
   `https://rektina-sub-web.vercel.app/api/billing/paystack/webhook`. The app
   authenticates Paystack using `PAYSTACK_SECRET_KEY` for both transaction
   initialization and verification; the current redirect checkout does not
   require a browser-side Paystack public key.
5. Configure PaymentPoint's webhook URL to
   `https://rektina-sub-web.vercel.app/api/billing/paymentpoint/webhook`. Rotate
   any PaymentPoint credentials that have been shared in chat before adding the
   replacement values to Vercel.
6. Create and verify an account, create its bank-transfer account in the
   dashboard, and make a small test transfer. Confirm the wallet is credited
   once, then test a
   small airtime or data purchase. Provider purchases are real transactions;
   never use an unintended recipient or amount. If a purchase has an uncertain
   outcome, recheck its status rather than submitting another order.

The dashboard supports account sign-in/up, project and API-key management,
PaymentPoint bank-transfer wallet deposits, wallet balance, airtime and data
purchases through Telecom Abode, and recent email activity. Existing Paystack
top-up verification remains available for earlier pending payments. Purchases use Telecom Abode's live catalog and
are charged at the listed price. Email sends are made
by calling `POST /api/v1/emails` with a project API key and an `Idempotency-Key`
header. The API key secret is only shown at creation; store it securely on your
application server, never in browser code.

VTU purchases require a verified account and sufficient wallet balance. Each
purchase is reserved atomically and sent to Telecom Abode with a stable request
ID. Confirmed provider failures are refunded; timeouts and unclear responses
remain reserved as `unknown` until checked with the provider's transaction
status endpoint. Do not retry an uncertain purchase by starting another one.
No automatic provider failover is performed.

Masub purchases are not enabled: its API documentation is not publicly
accessible, so its authentication, catalog, purchase, and status contract cannot
be verified. Do not add a Masub key to the app or route purchases to it until
the provider's official integration documentation is available.

The email API records Resend acceptance as `sent`; this does not assert inbox
delivery. The old Supabase migration is retained as historical reference only
and must not be applied to Neon. This creates a fresh Neon schema; it does not
import existing Supabase rows or accounts. Existing Supabase Auth password
hashes cannot be transferred by this migration. Complete and verify a separate
account/data backfill and password-reset enrollment before switching existing
users to this backend.

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
