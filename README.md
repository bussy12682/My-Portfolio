# Dual-Service VTU & Developer Messaging Infrastructure

**Draft documentation pack — v1.0 — 13 October 2026**

This repository documents a platform with two customer groups:

1. **Consumers:** airtime, mobile data and eventually bulk SMS.
2. **Developers and businesses:** messaging APIs, starting with email and potentially adding SMS APIs later.

The differentiator is that this is not only a VTU storefront. It combines consumer digital-service purchases with developer infrastructure: API credentials, usage metering, delivery events, logs, billing and operational controls.

## Open in VS Code

1. Extract this folder from the ZIP.
2. Open VS Code.
3. Select **File → Open Folder…** and choose `vtu_developer_infrastructure_vscode`.
4. Open `docs/` to browse the documents. Markdown preview: `Ctrl+Shift+V` (Windows/Linux) or `Cmd+Shift+V` (macOS).
5. Start with `docs/00-master-project-guide.md`, then `docs/01-prd.md`.

## Run the React prototype

The interactive Rektina.sub prototype is available as a React app. Splash, landing,
sign-in, sign-up and onboarding are rendered from `prototype.html`; the signed-in
dashboard is implemented in React with service purchases, history, wallet, profile,
settings, developer email-domain setup and a confirmed logout back to sign-in.

1. Install dependencies with `npm install`.
2. Start the app with `npm run dev`.
3. Build it with `npm run build`.

Dashboard actions are local previews, not live payments or email delivery. Add the
domain you own in **Email API & domains**; the exact SPF/DKIM records and verification
steps require an email provider connection. The app intentionally does not invent
DNS records or claim verification. `prototype.html` provides the shared splash, landing, sign-in, sign-up and onboarding
markup used by the React app.

## Documentation index

| File | Purpose |
|---|---|
| `docs/00-master-project-guide.md` | Scope, decisions, delivery sequence and checklist |
| `docs/01-prd.md` | Product vision, users, MVP, goals and acceptance criteria |
| `docs/02-srs.md` | Functional and non-functional requirements |
| `docs/03-sad.md` | High-level system architecture |
| `docs/04-sdd.md` | Detailed module and implementation design |
| `docs/05-erd.md` | Entities, relationships and Mermaid ER diagram |
| `docs/06-api-docs.md` | Draft API contract, examples, errors and webhooks |
| `docs/07-security-threat-model.md` | Security architecture, threats and mitigations |
| `docs/08-test-plan.md` | Test levels, scenarios and release gates |
| `docs/09-deployment-docs.md` | Environments, CI/CD, rollback and operations |
| `docs/10-developer-setup.md` | Local setup and contribution workflow |
| `docs/11-complete-documentation.md` | Combined narrative reference |

## Important status note

These are planning drafts, not a production-ready contract. Confirm the product name, providers, technology stack, prices, payment/wallet model, API limits, service-level targets and applicable Nigerian legal/regulatory obligations before implementation. Replace example URLs and example identifiers before publishing API docs.

## Recommended implementation order

1. Confirm the MVP, provider options, pricing and compliance requirements.
2. Approve the PRD and SRS.
3. Finalize architecture decisions and data model.
4. Finalize OpenAPI/API contracts and provider adapters.
5. Implement foundations, then VTU and email flows.
6. Add security tests, reconciliation, monitoring and operational runbooks.
7. Run a controlled beta before public launch.
