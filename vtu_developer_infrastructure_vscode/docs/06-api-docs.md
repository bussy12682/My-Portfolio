# API Documentation (Draft)

## 1. Conventions

Placeholder base URL: `https://api.example.com/v1` — replace before publication. HTTPS only; JSON payloads; timestamps in ISO 8601 UTC; money in integer minor units plus currency. Breaking changes require a new major version.

## 2. Authentication

```http
Authorization: Bearer YOUR_API_KEY
```

Never send API keys in query parameters or browser/frontend code. Use test keys in sandbox and live keys in production. Keys can be scoped and revoked. Any key shown in docs must be fake.

## 3. Idempotency

For purchases and other billable/non-repeatable operations, send:

```http
Idempotency-Key: a-unique-client-generated-value
```

Same key + same payload returns the original operation. Same key + different payload returns `409 idempotency_conflict`. Publish the actual retention window before launch.

## 4. Suggested endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Minimal public health status |
| GET | `/products?category=airtime` | List available products |
| POST | `/orders` | Create a VTU order |
| GET | `/orders/{order_id}` | Read order status |
| GET | `/me/usage` | Developer usage |
| POST | `/emails` | Submit email |
| GET | `/emails/{message_id}` | Read message status |
| POST | `/api-keys` | Create key; console-authenticated |
| POST | `/api-keys/{id}/revoke` | Revoke key |
| POST | `/webhook-endpoints` | Register webhook endpoint |
| GET | `/webhook-deliveries` | Inspect webhook delivery history |

Admin routes require separate permissions and should not be treated as ordinary developer endpoints.

## 5. Submit email

`POST /v1/emails`

```json
{
  "from": "notifications@verified-example.com",
  "to": ["recipient@example.net"],
  "subject": "Your receipt",
  "text": "Your order has been received.",
  "html": "<p>Your order has been received.</p>",
  "metadata": {
    "order_id": "ord_demo_123"
  }
}
```

Illustrative success response:

```json
{
  "request_id": "req_demo_123",
  "message_id": "msg_demo_456",
  "status": "queued",
  "accepted_at": "2026-10-13T12:00:00Z"
}
```

A queued/accepted response means the request was accepted for processing, not that it reached the recipient's inbox.

## 6. Create VTU order

`POST /v1/orders`

```json
{
  "product_id": "prod_demo_data_001",
  "recipient": "08000000000"
}
```

Send the idempotency key in the HTTP header. The server must return an internal order ID and status. Confirm the exact payment flow before finalizing this contract.

## 7. Error response

```json
{
  "error": {
    "code": "sender_not_verified",
    "message": "The sender domain must be verified before sending.",
    "request_id": "req_demo_123",
    "details": []
  }
}
```

Suggested codes: `invalid_request`, `authentication_required`, `invalid_api_key`, `insufficient_scope`, `sender_not_verified`, `recipient_limit_exceeded`, `rate_limit_exceeded`, `insufficient_balance`, `idempotency_conflict`, `product_unavailable`, `provider_unavailable`, `operation_pending`, `resource_not_found`, `internal_error`.

## 8. Webhooks

Potential events, subject to provider support:
- `email.queued`
- `email.accepted`
- `email.delivered`
- `email.bounced`
- `email.complained`
- `email.failed`
- `order.succeeded`
- `order.failed`
- `usage.threshold_reached`

Example event shape:

```json
{
  "event_id": "evt_demo_123",
  "type": "email.delivered",
  "created_at": "2026-10-13T12:01:00Z",
  "data": {
    "message_id": "msg_demo_456"
  }
}
```

Sign outbound webhooks using a finalized scheme such as HMAC-SHA256 over a canonical timestamp and raw body. Include timestamp and signature headers. Verify against the selected provider's official specification for inbound webhooks. Reject invalid signatures, prevent replay where possible, deduplicate events and retry delivery with bounded backoff.

## 9. Rate limits and quotas

Set independent limits for API requests, recipients per request, sends per minute/day, spend and failed authentication. Return `429` when exceeded and provide a retry hint where possible. Publish real numbers only after load tests and provider capacity review.

## 10. Lifecycle and semantic warnings

Publish an OpenAPI spec, sandbox, examples, changelog, deprecation policy and support route. Provider acceptance does not guarantee inbox placement. A VTU timeout may have an unknown outcome; clients should query order status instead of creating a new order.
