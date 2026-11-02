# Software Requirements Specification (SRS)

## 1. Purpose

Define observable, testable system requirements. Each requirement should be assigned an owner, priority, test case and release milestone.

## 2. Actors

Guest; Consumer; Developer/Workspace Owner; future Workspace Member; Support Agent; Finance/Operations; Administrator; Worker; Payment Provider; VTU Provider; Email Provider; future SMS Provider; Monitoring system.

## 3. Functional requirements

- **FR-001:** support registration, email verification, login, logout and recovery.
- **FR-002:** enforce authorization on every protected resource.
- **FR-003:** show active airtime/data products with network, plan, price and availability.
- **FR-004:** require recipient and price confirmation before purchase.
- **FR-005:** every purchase has an internal order ID and idempotency protection.
- **FR-006:** verify payment state server-side.
- **FR-007:** record provider calls and state changes with timestamps/correlation IDs.
- **FR-008:** model pending, processing, succeeded, failed, unknown/reconciliation-required and refunded states as applicable.
- **FR-009:** do not automatically interpret a timeout as a failed provider transaction.
- **FR-010:** developers can create isolated workspaces.
- **FR-011:** API keys are scoped, revocable and shown only at creation.
- **FR-012:** email API validates sender authorization, recipient count and content limits.
- **FR-013:** email submission returns stable request/message IDs and asynchronous status semantics.
- **FR-014:** record billable usage and provider cost attribution.
- **FR-015:** webhook deliveries are signed, timestamped, retried and deduplicated.
- **FR-016:** admin price/provider changes are permission-controlled and audited.
- **FR-017:** sensitive actions produce audit events.
- **FR-018:** support provider reconciliation and controlled manual resolution.
- **FR-019:** support tickets and internal notes have access controls.
- **FR-020:** health/readiness checks do not leak secrets.

## 4. External interfaces

- Web UI over HTTPS.
- Versioned REST API using JSON.
- Provider integrations isolated behind adapters.
- HTTPS webhooks with signature verification.
- Structured logs, metrics, traces and alerts.

## 5. Data requirements

Store users/workspaces, product catalogue, orders, payments, provider transactions, ledger entries, API-key metadata, message requests, usage events, webhook endpoints/deliveries, audit events and support records. Never store raw API secrets after initial display. Avoid storing payment-card details directly.

## 6. Non-functional requirements

- **NFR-01:** public traffic uses TLS.
- **NFR-02:** passwords use modern password hashing or delegated identity.
- **NFR-03:** secrets are not logged.
- **NFR-04:** financial changes are ledger-backed and reconcilable.
- **NFR-05:** duplicate callbacks/events are safe.
- **NFR-06:** backups and restore procedures are tested.
- **NFR-07:** production changes are reviewed and traceable.
- **NFR-08:** API errors use a consistent schema.
- **NFR-09:** logs minimize personal data and follow retention rules.
- **NFR-10:** resource limits protect against abuse.
- **NFR-11:** system health is observable by service, provider and business outcome.
- **NFR-12:** accessibility and responsive behaviour are tested.

## 7. Business rules

- **BR-01:** purchase price is fixed at confirmation or requoted before charge.
- **BR-02:** one idempotency key in a defined scope maps to one logical operation.
- **BR-03:** refunds/credits reference the original order and a reason.
- **BR-04:** unverified sender domains cannot send production email.
- **BR-05:** usage is charged according to published pricing and recorded units.
- **BR-06:** manual balance adjustments require actor, reason and audit; high-risk changes need a second approver.
- **BR-07:** retries respect provider idempotency capabilities.
- **BR-08:** consumer transactions and developer usage are accounted for separately unless explicitly connected through the ledger.

## 8. Error handling

Use stable machine-readable codes. Suggested mapping:
- `400` malformed request
- `401` missing/invalid credentials
- `403` insufficient permission
- `404` resource unavailable
- `409` conflict/idempotency conflict
- `422` semantically invalid fields
- `429` rate limit
- `5xx` server failure

Never expose stack traces or provider secrets.

## 9. Constraints and assumptions

Assumption: initial launch is in Nigeria; confirm actual legal/operational scope. Email is the first developer API. Provider APIs, sender rules and pricing must be verified. Modular monolith + PostgreSQL + durable queue is the current recommendation, not a final decision.

## 10. Traceability

Each requirement must map to a design component, data entity, API/UI surface, test case and release milestone.
