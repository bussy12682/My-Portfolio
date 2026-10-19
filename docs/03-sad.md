# Software Architecture Document (SAD)

## 1. Summary

Recommended first release: a modular monolith with separately running worker processes and provider adapters. This keeps operations manageable while preserving clear module boundaries.

## 2. System context

**Clients:** consumer web app, developer console, external developer applications and admin console.

**Core platform:** API/application backend, identity, catalogue, orders, billing/ledger, messaging, usage, webhook engine, admin/support and audit.

**External systems:** payment processor, VTU aggregator, email provider, future SMS provider, DNS/domain verification, monitoring and support tools.

## 3. Logical components

1. Web client.
2. REST API/BFF.
3. Identity and access.
4. Consumer catalogue.
5. Order/transaction state machine.
6. Provider adapters.
7. Payment verification.
8. Ledger/billing.
9. Developer workspace/API-key service.
10. Email submission service.
11. Durable queue and workers.
12. Webhook dispatcher/receiver.
13. Usage metering.
14. Admin/support.
15. Audit/event log.
16. Observability.

## 4. Suggested technology baseline

Use the team's strongest maintainable stack. One reasonable option is TypeScript/Node.js for API and workers, PostgreSQL for transactional data, and a durable queue such as a managed queue, RabbitMQ or a suitable database-backed job system. Redis may be useful for caching or coordination but should not be the only durable store for critical work. Hosting and region depend on budget, compliance, vendor access and operational skill.

## 5. Main flows

### VTU purchase
Quote → validate user/recipient/product → create pending order with idempotency → verify payment → enqueue fulfillment → provider adapter request → record provider result → reconcile ambiguous outcomes → update status.

### Email send
Authenticate key → enforce workspace/sender/limits → validate payload → create message and usage reservation → enqueue send → provider adapter submission → store provider ID/status → process provider webhook → update delivery state and billing.

## 6. Architecture principles

- Provider abstraction.
- Explicit state machines.
- At-least-once jobs with idempotent handlers.
- Short database transactions; do not hold locks during slow provider calls.
- Append-only ledger and audit records.
- Correlation IDs across API, workers and providers.
- Asynchronous delivery semantics.
- Separate public API and admin privileges.
- Browser state is never financial truth.

## 7. Resilience

Use bounded timeouts, backoff with jitter, retry ceilings, dead-letter queues and operator-visible failure states. Classify permanent, transient and unknown errors. For ambiguous VTU outcomes, query/reconcile status before retrying. One provider outage should not block unrelated services.

## 8. Security architecture

TLS; managed secrets; API-key hashing and scope checks; MFA for admins; RBAC; signed webhook verification; WAF/rate limits; restricted admin access; audit logs; encrypted backups; dependency scanning and least-privilege provider credentials.

## 9. Observability

Log request/correlation IDs, workspace/order/message IDs and provider name, while redacting secrets and minimizing message content. Monitor API rate/errors/latency, queue age/depth, provider errors, transaction success/unknown states, bounce/complaint signals, webhook lag, key abuse and billing discrepancies.

## 10. Architecture decision records

Create ADRs for:
- Modular monolith vs microservices.
- Database and migration strategy.
- Queue technology.
- VTU provider/fallback.
- Payment provider/callback verification.
- Email provider.
- Wallet/prepaid/postpaid billing.
- API-key format/hash.
- Hosting and region.
- Retention/privacy policy.

Each ADR records context, options, decision, consequences and date.

## 11. Acceptance

Critical flows have sequence/state diagrams; provider boundaries are isolated; data ownership is explicit; security boundaries are reviewed; recovery is tested; metrics and runbooks exist before public launch.
