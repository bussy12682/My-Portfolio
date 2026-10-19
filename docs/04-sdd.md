# Software Design Description (SDD)

## 1. Design conventions

Keep business rules in domain/application modules, transport concerns in controllers, persistence behind repositories and third-party calls behind provider adapters. Validate inputs at boundaries and enforce domain invariants. Use typed internal errors and stable public error codes.

## 2. Suggested repository layout

```text
/apps
  /web       # consumer and developer console
  /api       # REST API
  /worker    # queue consumers and scheduled jobs
/packages
  /domain    # entities, business rules, state machines
  /providers # VTU, payment, email adapters
  /db        # schema, migrations, repositories
  /contracts # schemas and shared API types
/docs        # PRD, SRS, ADRs, API docs and runbooks
/tests       # integration, e2e and security tests
```

Adapt this to the chosen stack; it is a proposal, not an existing repository requirement.

## 3. Domain services

- `IdentityService`: registration, verification, recovery and sessions.
- `WorkspaceService`: membership and tenant isolation.
- `CatalogueService`: active products and price snapshots.
- `OrderService`: order creation and state transitions.
- `PaymentService`: trusted callbacks and reconciliation.
- `FulfillmentService`: safe provider dispatch.
- `LedgerService`: append balanced entries and calculate balances.
- `ApiKeyService`: issue, hash, scope, rotate and revoke.
- `EmailService`: sender validation, usage reservation and queueing.
- `WebhookService`: verify inbound events and dispatch outbound events.
- `UsageService`: deduplicate usage and calculate billable units.
- `AdminService`: guarded configuration changes.

## 4. State models

### Order
`created → awaiting_payment → paid → queued → processing → succeeded | failed | unknown`

An unknown result moves to reconciliation. Eligible completed transactions may move to refund-pending and refunded/partially-refunded states. Validate all transitions and timestamp them.

### Email
`accepted → queued → submitted → delivered | bounced | complained | failed`

Exact statuses depend on provider capabilities. Provider acceptance does not mean inbox delivery.

## 5. Idempotency

Require `Idempotency-Key` for purchases and other non-repeatable/billable operations. Persist scope (account/workspace + endpoint), key hash, request fingerprint, operation ID and response reference. Same key + same payload returns the original operation. Same key + different payload returns `409 idempotency_conflict`. Workers need deduplication too.

## 6. Ledger

Use append-only entries, not a mutable balance field as the sole financial truth. Journal transactions should balance under the chosen accounting model. Corrections use reversing/adjusting entries with actor, reason and original reference. Define pending authorizations, fees, refunds, chargebacks and provider settlement with a finance/accounting reviewer.

## 7. API key design

Generate high-entropy random keys with a recognizable non-secret prefix and environment label. Reveal the full key once. Store a one-way hash; support scopes, creation/last-used timestamps, expiration, revocation and rotation. Never put keys in URLs, analytics, client-side bundles or logs. Use separate test/live keys.

## 8. Provider adapter contract

Each adapter should expose normalized request/response types, capability metadata, timeout policy, error classification, idempotency support, status lookup and health checks where available. Example conceptual methods: `quoteProduct`, `submitTopup`, `getTransactionStatus`, `sendEmail`, `verifyWebhook`.

## 9. Webhooks

Verify signatures against the raw request body and timestamp according to the provider's official specification. Reject invalid signatures and enforce replay windows where supported. Persist event IDs before asynchronous processing and deduplicate by provider + event ID.

For outbound webhooks, sign a canonical payload with timestamp, include a stable event ID, retry with backoff, cap retries and expose delivery attempts.

## 10. Error model

Internal categories: validation, authentication, authorization, rate limit, insufficient funds, provider transient, provider permanent, provider unknown, conflict and internal error. Map to stable HTTP codes and redact raw provider data.

## 11. Database and concurrency

Use transactions for order creation, ledger posting and usage reservation. Add unique constraints for idempotency scopes, provider references and webhook event IDs. Use locking or optimistic concurrency for contested operations. Do not keep DB transactions open while waiting on providers.

## 12. Configuration

Separate local/test/staging/production settings. Validate required config at startup. Provider credentials belong in a managed secret store, never source control. Feature flags need owners, safe defaults and review/expiry dates.

## 13. Code review checklist

- [ ] Input validation.
- [ ] Authorization and tenant isolation.
- [ ] Idempotency and safe retries.
- [ ] Transaction boundaries.
- [ ] Secret/log redaction.
- [ ] Migrations/backfills.
- [ ] Observability.
- [ ] Failure-path tests.
- [ ] API contract and docs updated.
- [ ] Rollback/recovery plan.
