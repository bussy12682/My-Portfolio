# Developer Setup Guide

## 1. Purpose

This is a stack-neutral starting guide. Replace illustrative commands with the exact commands used by the actual repository once the stack is selected.

## 2. Prerequisites

- Git.
- Supported Node.js LTS or the selected runtime.
- Chosen package manager.
- PostgreSQL.
- Durable queue or local substitute.
- Provider sandbox accounts.
- API client such as curl or Postman.
- Editor such as VS Code.
- Docker only if the project chooses containerized local dependencies.

## 3. Clone and install (illustrative)

```bash
git clone <repository-url>
cd <repository-folder>
cp .env.example .env

# Install dependencies with the package manager chosen by the repository.
npm install

# Start local dependencies according to the repository's instructions.
# Apply migrations using the actual migration script.
# Start API, web app and worker using documented scripts.
```

The repository's `package.json` or equivalent must define the real scripts; do not assume these placeholder commands will work before implementation.

## 4. Environment setup

Create a local database and least-privilege credentials. Configure sandbox-only provider keys. Use a verified test sender/domain. Set application URLs and session secrets. Do not use real customer data. Keep `.env` local and commit only `.env.example` with placeholders.

## 5. Database workflow

Run versioned migrations and seed synthetic users/products. Reset only local/test databases; never run destructive reset commands against staging or production. Label seeded prices as test-only.

## 6. Running and validating

Start API, frontend and worker as documented. Check readiness endpoint. Run formatter, linter, type checker, unit tests and integration tests. Verify queue processing. Send test email only to allowlisted addresses/domains. Test VTU flows with sandbox or mocked adapters before live transactions.

## 7. Repository conventions

Use feature branches and pull requests. Include tests and docs. Do not commit secrets. Add migrations for schema changes. Update OpenAPI/changelog for public contract changes. Require review for billing, auth, provider and admin changes.

## 8. Provider adapter development

Implement against an interface and normalized domain model. Add sandbox contract tests. Classify transient/permanent/unknown failures. Redact sensitive provider response fields. Document idempotency and status lookup capabilities. Do not assume all providers support identical delivery events.

## 9. Debugging

Trace requests using request/correlation IDs across API, worker and provider adapter. Check queue depth, provider status and sanitized logs. Never paste API keys, full recipient lists or message content into issues/chat. For a timeout, inspect status/reconciliation before retrying a financial operation.

## 10. Troubleshooting

- **Database connection failure:** verify URL, network, credentials and migrations.
- **Email rejected:** verify key scope, sender domain, provider quota and error class.
- **Webhook missing:** check endpoint reachability, signature, event subscription and retry logs.
- **VTU pending:** check provider reference and reconciliation queue; do not blindly create another order.
- **Flaky tests:** remove live provider dependency or isolate test data.

## 11. Definition of done

- [ ] Requirement linked.
- [ ] Design considered.
- [ ] Input validation and authorization included.
- [ ] Idempotency/failure paths covered.
- [ ] Tests pass.
- [ ] Migration reviewed.
- [ ] Logs and metrics added.
- [ ] Docs/OpenAPI updated.
- [ ] No secrets in diff.
- [ ] Reviewer approval obtained.
