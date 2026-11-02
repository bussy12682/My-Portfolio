# Master Project Documentation Guide

**Project:** Dual-Service VTU & Developer Messaging Infrastructure  
**Version:** Draft v1.0 — 13 October 2026

## 1. Executive summary

The platform serves two connected customer groups through a shared foundation:

- Consumers buy airtime, mobile data and eventually bulk SMS.
- Developers and businesses integrate messaging capabilities through APIs, beginning with email and potentially adding SMS APIs later.

The product is differentiated from a conventional VTU website by its developer infrastructure: API keys, sender verification, delivery events, usage metering, logs, billing and operational controls.

## 2. Product goals

- Offer competitively priced airtime and data top-ups.
- Provide a controlled bulk-SMS experience when provider and compliance requirements are confirmed.
- Launch a documented email API with secure keys, sender/domain verification, delivery events where supported, usage tracking and clear errors.
- Make transactions, costs, margins, refunds and provider outcomes auditable.
- Keep consumer purchases and developer messaging logically separated while reusing suitable account, billing and support capabilities.

## 3. Suggested release scope

### MVP
- Registration, verification, login and recovery.
- Consumer airtime/data catalogue, quote, purchase and transaction history.
- Developer workspace and test/live API keys.
- Email API, sender/domain verification and usage dashboard.
- Provider webhooks and outbound webhook delivery where needed.
- Order/message status, admin tools, audit logs, support and basic monitoring.

### Later phases
- Consumer bulk SMS.
- Developer SMS API.
- Team roles, advanced analytics, scheduled campaigns and more providers.
- More advanced routing, fraud scoring and additional SDKs.

Do not promise all features in the MVP. Validate vendor coverage, cost and legal requirements first.

## 4. Required documents

- **PRD:** what to build and why.
- **SRS:** measurable system requirements.
- **SAD:** high-level architecture and boundaries.
- **SDD:** module-level design and implementation rules.
- **ERD:** data entities and relationships.
- **API docs:** external API contract.
- **Security architecture/threat model:** assets, threats and controls.
- **Test plan:** how requirements will be verified.
- **Deployment docs:** release, operations and recovery.
- **Developer setup guide:** local development and contribution steps.

## 5. Decisions to confirm

1. Final brand name and domain.
2. Launch geography and supported mobile operators.
3. VTU aggregator and fallback options; confirm price, settlement, refund, idempotency and status-query support.
4. Email provider; compare pricing, deliverability, DNS verification, webhooks, regional availability and support.
5. Bulk-SMS provider and sender-ID requirements.
6. Payment processor and whether the product uses prepaid credits, postpaid invoices or a wallet.
7. Technology stack, database, queue, hosting and monitoring vendors.
8. Applicable privacy, consumer, telecom and messaging obligations.
9. Price floor, payment fees, taxes, fraud allowance, quotas and rate limits.
10. Support hours, refund policy and incident escalation owners.

## 6. Architecture principles

- Start with a modular monolith and separately running worker process; split services only when justified.
- Use PostgreSQL or another suitable transactional database as the source of truth.
- Use durable queues for provider calls, retries and webhook processing.
- Make money-affecting operations idempotent and ledger-backed.
- Never store raw API secrets after displaying them once.
- Verify webhook signatures and deduplicate events.
- Treat provider timeouts as potentially unknown outcomes, not automatic failures.
- Keep secrets and personal data out of logs.
- Make support/admin actions auditable.

## 7. Delivery sequence

1. Discovery: providers, pricing, commercial terms and compliance.
2. Foundations: repository, auth, database, secrets, CI and audit logging.
3. Consumer VTU: catalogue, order state machine, payment verification, provider adapter and reconciliation.
4. Developer email: workspaces, keys, sender verification, send endpoint, queue, provider adapter, webhooks and usage.
5. Console/admin: transaction history, usage, logs, support and safe operational controls.
6. Hardening: security review, load tests, failure simulations and restore drill.
7. Limited beta: allowlisted users, low limits and close monitoring.
8. Public launch: staged rollout, support process and status communication.

## 8. Definition of done

A feature is not done just because its happy path works. It needs input validation, authorization, safe retry/idempotency behaviour, error handling, tests, audit/metrics, documentation and a recovery path. Production launch additionally requires verified provider configuration, reviewed pricing, privacy/legal review, tested backup restore and incident contacts.

## 9. Launch checklist

- [ ] Brand/domain confirmed.
- [ ] Providers and commercial terms approved.
- [ ] Unit economics and price floors calculated.
- [ ] Legal/privacy/messaging review completed.
- [ ] PRD and acceptance criteria approved.
- [ ] Requirements traceable to tests.
- [ ] Architecture and data model reviewed.
- [ ] API contract versioned.
- [ ] Threat model reviewed.
- [ ] CI and automated tests passing.
- [ ] Secrets and production access configured.
- [ ] Backups and restore test verified.
- [ ] Provider reconciliation/refund workflows tested.
- [ ] Alerts, dashboards, runbooks and support escalation ready.
- [ ] Beta exit criteria met and release approved.
