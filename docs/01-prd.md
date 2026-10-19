# Product Requirements Document (PRD)

## 1. Product vision

Build a trustworthy, cost-conscious platform that makes everyday digital services easy to buy and messaging infrastructure easy to integrate. Consumers get airtime/data and later bulk SMS. Developers get documented APIs, secure credentials, transparent usage and delivery visibility, beginning with email.

## 2. Problem statement

Traditional VTU sites focus on top-ups and may offer limited developer tooling. Developers separately assemble email/SMS vendors, credentials, billing and observability. This platform combines consumer utility services with developer-grade messaging while keeping journeys and billing controls clear.

## 3. Target users

### Consumer
Wants to purchase the correct airtime/data plan, pay safely, see status and get support if a transaction fails.

### Developer or business
Wants to create a workspace, verify a sender/domain, create an API key, send a test email, inspect logs and delivery events, track usage and control spend.

### Operations/admin
Wants to configure products/providers, reconcile transactions, handle disputes, detect abuse and view system health.

## 4. Goals and success metrics

Measure:
- Successful VTU fulfillment rate.
- Provider timeout and unknown-outcome rate.
- API p50/p95 latency and error rate.
- First successful developer API call.
- Email accepted/delivered/bounced/complained rates where provider events support these.
- Webhook processing delay and retry exhaustion.
- Active developer workspaces and usage.
- Gross margin per product, refund resolution time and fraud loss.

Set numerical targets after provider selection and baseline measurement. Do not promise inbox placement.

## 5. MVP scope

- Accounts, email verification, login and recovery.
- Airtime/data catalogue, price quote, purchase and order history.
- Payment verification and provider fulfillment.
- Developer workspaces and API-key create/revoke/rotate.
- Email API and verified sender/domain workflow.
- Usage records and dashboard.
- Webhook event processing and outbound webhook delivery.
- Admin product/provider/price controls with role restrictions.
- Audit logs, support workflow and basic monitoring.

## 6. Out of scope for MVP

- Full marketing automation/CRM.
- Unrestricted bulk campaigns.
- Guaranteed inbox placement.
- All countries and operators.
- Developer SMS API unless explicitly added to the first release.
- Active-active multi-region infrastructure.
- Storing payment-card data directly.
- User-managed SMTP relay unless separately designed.

## 7. Core journeys

### Consumer purchase
Register → verify → select airtime/data → enter recipient and plan → see price → confirm payment → fulfillment → view final status/receipt.

### Developer email
Register → create workspace → verify sender/domain → create key → call email endpoint → receive request ID → inspect usage/logs → configure webhooks → rotate/revoke key.

### Operations
Review flagged order → inspect provider reference and ledger → reconcile status → retry only if safe → refund/adjust with reason and audit record.

## 8. Product requirements

- **PRD-F01 Accounts:** users can register, verify and recover access.
- **PRD-F02 Catalogue:** show active products and final price before confirmation.
- **PRD-F03 Orders:** create orders with unique IDs and idempotency.
- **PRD-F04 Payments:** verify payment server-side; do not trust browser redirects alone.
- **PRD-F05 Fulfillment:** invoke provider through an adapter and store provider references.
- **PRD-F06 Refunds:** support controlled, auditable refunds/credits.
- **PRD-F07 Workspaces:** isolate developer resources by workspace.
- **PRD-F08 API keys:** scope, reveal once, expire optionally, rotate and revoke.
- **PRD-F09 Email API:** validate recipients, sender, subject/content and request limits.
- **PRD-F10 Sender verification:** block production sends from unverified senders.
- **PRD-F11 Usage:** attribute units and provider cost to workspace/key.
- **PRD-F12 Webhooks:** signed, retryable and deduplicated event delivery.
- **PRD-F13 Admin:** permission-control and audit product/provider changes.
- **PRD-F14 Audit:** record sensitive admin and credential actions.
- **PRD-F15 Support:** trace orders/messages by correlation ID.

## 9. Non-functional requirements

- Security: least privilege, encryption in transit, secret protection, rate limits and abuse controls.
- Reliability: durable queues, explicit pending/unknown states and idempotent handlers.
- Performance: set targets after baseline; an initial internal read-endpoint target could be p95 below 500 ms, excluding third-party delivery.
- Availability: define SLO after provider review.
- Accessibility: responsive UI and keyboard support.
- Observability: structured logs, metrics, traces and alerts.
- Maintainability: provider adapters and versioned contracts.

## 10. Pricing and monetization

Potential revenue:
- Margin on airtime/data.
- Email usage tiers or per-unit pricing.
- Prepaid credits or postpaid invoices.
- Higher quotas for verified customers.

Calculate price floors from provider cost, payment fees, taxes, fraud/refund allowance and target margin. Do not claim “cheapest” without benchmarking. Show charges before confirmation and enforce spending caps.

## 11. Risks and dependencies

Provider outages and price changes; thin VTU margins; spam abuse; sender reputation; vendor-specific payloads; refunds/chargebacks; delayed webhooks; regulatory requirements; credential theft. Mitigate with adapters, caps, reconciliation, sender verification, queueing, terms and runbooks.

## 12. Acceptance criteria

- Consumer purchases produce a traceable final status.
- Duplicate requests do not double-charge or duplicate fulfillment.
- Developers can issue/revoke keys and send only from approved senders.
- Usage is attributable to workspace/key.
- Webhooks are signed, retryable and deduplicated.
- Admin actions are authorized and audited.
- Critical failure paths have automated tests.
- Support can trace an order/message by correlation ID.

## 13. Release plan

Private technical alpha → provider sandbox tests → allowlisted developer beta → limited consumer beta → staged public launch. Add SMS APIs only after email stability, abuse controls, provider validation and unit economics are demonstrated.
