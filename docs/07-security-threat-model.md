# Security Architecture & Threat Model

## 1. Security objectives

Protect account access, API credentials, customer funds/credits, recipient data, sender reputation, provider credentials, transaction integrity and availability. Preserve confidentiality, integrity, availability, accountability and privacy.

## 2. Assets

User credentials/sessions; API keys; sender/domain credentials; provider/payment secrets; contact data; email metadata/content; orders; ledger; prices/margins; admin access; webhook secrets; logs and backups.

## 3. Trust boundaries

- Browser/client ↔ public API.
- Developer application ↔ API-key endpoints.
- Public API ↔ internal modules/queue.
- Platform ↔ payment/VTU/email providers.
- Provider webhooks ↔ webhook receiver.
- Admin/support console ↔ production data.
- CI/CD ↔ production and secrets manager.

## 4. Threat method

Use STRIDE at each trust boundary and add domain-specific abuse cases. Score likelihood and impact (low/medium/high), prioritize critical/high threats and review after provider selection, wallet design, new SMS/campaign features and incidents.

## 5. STRIDE threats and controls

- **Spoofing:** stolen sessions/API keys → admin MFA, secure sessions, scoped keys, rotation and anomaly alerts.
- **Tampering:** forged payment/webhook events → signature verification, trusted callback validation, immutable audit and ledger.
- **Repudiation:** disputed purchases/refunds → correlation IDs, append-only audit, provider references and timestamps.
- **Information disclosure:** leaked secrets/recipient data → secrets manager, redaction, encryption, access controls and retention.
- **Denial of service:** email floods/API abuse → per-key/workspace quotas, WAF, queue backpressure and circuit breakers.
- **Elevation of privilege:** tenant ID manipulation/admin misuse → server-side ownership checks, RBAC, least privilege and dual approval for high-risk adjustments.

## 6. Domain-specific abuse cases

Email spam/phishing; account farming; stolen API key bulk sending; sender impersonation; bounce/complaint spikes; trial-credit abuse; SMS pumping if SMS launches; VTU enumeration; duplicate top-up; payment replay; chargeback abuse; fraudulent balance adjustment; provider response spoofing; webhook replay; SSRF through custom webhook URLs.

Controls: sender/domain verification, recipient/volume caps, suppression lists, abuse detection, payment signature verification, idempotency, replay protection, egress restrictions and controlled admin actions.

## 7. Identity and access

Use least-privilege roles. Require MFA for production admins. Separate support, finance and engineering permissions. Scope keys by workspace and operation. Restrict production access, review access periodically and revoke offboarded credentials. Enforce tenant isolation in every resource query.

## 8. Secrets and cryptography

Store provider credentials in a managed secret store. Never commit or log secrets. Store API-key hashes and protect any pepper in a secret manager. Encrypt transport and backups. Define key rotation and emergency revocation.

## 9. Payment and ledger controls

Do not trust browser redirects as proof of payment. Verify signatures, amounts, currency and order reference server-side. Use unique provider references, idempotency, reconciliation reports and immutable journal entries. Require reasons for adjustments and dual approval above an agreed threshold.

## 10. Email security and privacy

Verify sender domains with required DNS records; configure SPF, DKIM and DMARC as appropriate. Enforce recipient limits and suppression handling. Minimize body retention and log exposure. Publish acceptable-use policy and complaint handling. Review marketing-email unsubscribe rules separately from transactional mail.

## 11. Secure development and operations

Threat model during design; peer review; dependency/SAST/secret scans; reviewed dependencies; protected branches; CI least privilege; production access logging; encrypted backups; vulnerability reporting; patch SLAs and incident drills.

## 12. Incident response

Prepare runbooks for key compromise, provider credential exposure, payment fraud, spam/complaint spike, provider outage, data breach and ledger mismatch.

Sequence: detect → contain (revoke keys/disable sending/freeze affected operations) → preserve evidence → assess scope → notify responsible owners and relevant parties as required → recover → reconcile → postmortem.

## 13. Privacy and compliance

Confirm applicable Nigerian data-protection, consumer-protection, telecommunications, sender-ID and messaging rules with qualified counsel and relevant providers. Define purpose, lawful basis, notices, retention, access/deletion handling, cross-border transfer assessment and vendor contracts. This is not legal advice.

## 14. Initial risk register

- **Critical:** duplicate fulfillment/double charge; compromised provider/payment secret; unrestricted email abuse; tenant-isolation flaw.
- **High:** webhook forgery/replay; balance inconsistency; provider outage without reconciliation; admin misuse; sensitive logs.
- **Medium:** noisy alerts, delayed webhook processing, non-critical metadata exposure.

Re-score with actual likelihood and impact before launch.

## 15. Security release gates

- [ ] No unresolved critical/high exploitable findings without formal risk acceptance.
- [ ] Key rotation tested and admin MFA enabled.
- [ ] Webhook signature/replay tests pass.
- [ ] Payment callback verification tested.
- [ ] Authorization and tenant-isolation tests pass.
- [ ] Rate limits enabled.
- [ ] Secrets absent from repository and logs.
- [ ] Backup restore drill passes.
- [ ] Incident contacts and abuse-response procedures approved.
