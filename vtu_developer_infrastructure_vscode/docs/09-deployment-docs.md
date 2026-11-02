# Deployment Documentation

## 1. Deployment model

Deploy web/API and worker processes separately, even if they share one codebase. Prefer managed PostgreSQL and a durable queue where budget allows. Put public traffic behind HTTPS termination and appropriate rate limiting. Choose the hosting provider and region after reviewing cost, compliance, vendor access and operational support.

## 2. Environments

Separate local, CI, staging and production. Use different databases, API keys, provider credentials, sender domains and payment modes. Never use live provider secrets locally. Do not copy production data to staging without an approved masking process.

## 3. Configuration

Potential settings:
- `APP_ENV`
- `DATABASE_URL`
- queue configuration
- session/cookie settings
- auth secret
- API-key hashing secret/pepper if used
- provider credentials
- payment webhook secret
- email webhook secret
- frontend origin and public API URL
- rate-limit configuration
- logging/metrics endpoints

Validate required settings at startup. Keep `.env` files local; commit only safe `.env.example` placeholders.

## 4. CI/CD pipeline

On pull request: format/lint, typecheck, unit tests, integration tests, schema validation, dependency scan, secret scan and build.

On merge: create immutable artifact, deploy to staging, run migrations safely and smoke-test. Require approval for production. Use progressive rollout where possible and record release metadata.

## 5. Database migrations

Use versioned migrations and expand/contract changes: add compatible schema → deploy compatible code → backfill → enforce constraints → remove old fields in a later release. Back up before risky migrations. Application rollback does not necessarily reverse schema changes.

## 6. Secrets

Use hosting secret storage or a dedicated manager. Limit access to deployment identity. Rotate exposed secrets immediately and on a defined schedule. Avoid printing environment variables in logs. Preview deployments must not access production secrets.

## 7. Release procedure

1. Review changelog and migrations.
2. Verify staging tests.
3. Confirm provider status and price configuration.
4. Announce maintenance if needed.
5. Verify backup for risky changes.
6. Deploy.
7. Run smoke tests.
8. Monitor errors, latency, queue and provider metrics.
9. Verify an approved low-risk transaction if needed.
10. Record release and approver.

## 8. Rollback and recovery

Rollback the application artifact if schema-compatible; otherwise use a forward fix. Disable a faulty provider or feature flag if safe. Keep pending/unknown transactions for reconciliation instead of blindly replaying them. Restore the database only under incident coordination because newer writes may be lost. Define RPO/RTO with the business owner.

## 9. Monitoring and alerts

Alert on API errors/latency, provider failure rate, queue age/depth, unknown VTU transactions, payment reconciliation mismatch, email bounce/complaint spikes, webhook retry exhaustion, API-key abuse, database saturation, backup failures and domain/certificate issues. Every alert needs an owner and runbook.

## 10. Backup and disaster recovery

Automated encrypted backups; point-in-time recovery if available; retention policy; separate access controls; periodic restore tests. Define target RPO/RTO after business-impact analysis. Do not store raw secrets in ordinary backups.

## 11. Operational runbooks

Provider outage; unknown VTU transaction; payment callback failure; email abuse/spam complaint; API-key compromise; webhook backlog; queue outage; database saturation; failed migration; backup restore; ledger mismatch; data incident.

## 12. Production launch checklist

- [ ] Domain and TLS ready.
- [ ] Sender DNS/domain verification completed as needed.
- [ ] Provider contracts and live credentials verified.
- [ ] Prices and margins checked.
- [ ] Payment callbacks verified.
- [ ] Admin MFA enabled.
- [ ] Rate limits and quotas enabled.
- [ ] Backup restoration verified.
- [ ] Dashboards and alerts live.
- [ ] Support and incident contacts ready.
- [ ] Privacy, terms and acceptable-use policies reviewed.
- [ ] Staged rollout and rollback owner assigned.
