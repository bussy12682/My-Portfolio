import { createHash } from "node:crypto";
import { ApiError, errorResponse } from "@/lib/server/errors";
import {
  emailPriceKobo,
  sendGridApiKey,
  sendGridFrom,
  sendGridFromName,
} from "@/lib/server/env";
import { databaseRequest, databaseUrl } from "@/lib/server/supabase";
import { readJson, stringField } from "@/lib/server/http";

type ApiKeyRow = {
  id: string;
  project_id: string;
  owner_id: string;
  revoked_at: string | null;
  last_used_at: string | null;
};
type Reservation = { message_id: string; message_status: string; is_duplicate: boolean };
type FinishedMessage = { message_id: string; message_status: string };

function isEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function authorizationKey(request: Request) {
    const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]?.trim()) throw new ApiError(401, "invalid_api_key", "Provide a valid Permitt API key.");
  return match[1].trim();
}

async function finishMessage(
  ownerId: string,
  messageId: string,
  status: "sent" | "failed" | "unknown",
  providerMessageId?: string,
  failureReason?: string,
) {
  return databaseRequest<FinishedMessage[]>("rpc/finish_email_send", {
    method: "POST",
    body: JSON.stringify({
      p_owner_id: ownerId,
      p_message_id: messageId,
      p_status: status,
      p_provider_message_id: providerMessageId ?? null,
      p_failure_reason: failureReason ?? null,
    }),
  });
}

export async function POST(request: Request) {
  try {
    const rawKey = authorizationKey(request);
    const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
    if (!/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
      throw new ApiError(400, "idempotency_key_required", "Provide an Idempotency-Key header (8–128 characters).");
    }

    const body = await readJson(request, 96_000);
    const recipient = stringField(body, "to", { max: 254 })!.toLowerCase();
    const subject = stringField(body, "subject", { max: 200 })!;
    const text = stringField(body, "text", { max: 40_000, optional: true });
    const html = stringField(body, "html", { max: 40_000, optional: true });
    if (!isEmail(recipient)) throw new ApiError(400, "invalid_recipient", "The `to` field must be a valid email address.");
    if (!text && !html) throw new ApiError(400, "missing_content", "Provide a `text` or `html` message body.");
    if (/[\r\n]/.test(subject)) throw new ApiError(400, "invalid_subject", "The subject cannot contain line breaks.");

    const from = sendGridFrom();
    const price = emailPriceKobo();
    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    const keys = await databaseRequest<ApiKeyRow[]>(
      databaseUrl("api_keys", {
        select: "id,project_id,owner_id,revoked_at,last_used_at",
        key_hash: `eq.${keyHash}`,
        revoked_at: "is.null",
        limit: "1",
      }),
    );
    const key = keys[0];
    if (!key || key.revoked_at) throw new ApiError(401, "invalid_api_key", "The API key is invalid or revoked.");

    await databaseRequest(
      `api_keys?id=eq.${encodeURIComponent(key.id)}&revoked_at=is.null`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ last_used_at: new Date().toISOString() }),
      },
    );

    const requestHash = createHash("sha256")
      .update(JSON.stringify({ to: recipient, subject, text: text ?? null, html: html ?? null }))
      .digest("hex");
    const reservation = await databaseRequest<Reservation[]>("rpc/reserve_email_send", {
      method: "POST",
      body: JSON.stringify({
        p_owner_id: key.owner_id,
        p_project_id: key.project_id,
        p_api_key_id: key.id,
        p_idempotency_key: idempotencyKey,
        p_request_hash: requestHash,
        p_sender: from,
        p_recipient: recipient,
        p_subject: subject,
        p_text_body: text ?? null,
        p_html_body: html ?? null,
        p_amount_kobo: price,
      }),
    });
    const message = reservation[0];
    if (!message) throw new ApiError(503, "send_unavailable", "The email request could not be reserved.");
    if (message.is_duplicate) {
      const status = message.message_status;
      const responseStatus = status === "sent" ? 200 : status === "processing" ? 202 : status === "failed" ? 502 : 503;
      return Response.json(
        { id: message.message_id, status },
        { status: responseStatus, headers: { "Idempotency-Replayed": "true" } },
      );
    }

    let sendGridResponse: Response;
    try {
      sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          authorization: `Bearer ${sendGridApiKey()}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: from, name: sendGridFromName().replace(/[\r\n]/g, "").slice(0, 100) },
          subject,
          content: [
            ...(text ? [{ type: "text/plain", value: text }] : []),
            ...(html ? [{ type: "text/html", value: html }] : []),
          ],
          custom_args: { permitt_message_id: message.message_id },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      await finishMessage(key.owner_id, message.message_id, "unknown", undefined, "provider_response_unknown");
      throw new ApiError(
        503,
        "delivery_status_unknown",
        "The provider response was not received. Check the message log before retrying with a new key.",
      );
    }

    if (!sendGridResponse.ok) {
      if (sendGridResponse.status >= 500) {
        await finishMessage(key.owner_id, message.message_id, "unknown", undefined, "provider_response_unknown");
        throw new ApiError(
          503,
          "delivery_status_unknown",
          "The provider could not confirm delivery. Check the message log before retrying.",
        );
      }

      await finishMessage(
        key.owner_id,
        message.message_id,
        "failed",
        undefined,
        `sendgrid_rejected_${sendGridResponse.status}`,
      );
      throw new ApiError(502, "provider_rejected", "The email provider rejected the message; the reserved credit was returned.");
    }

    const finished = await finishMessage(
      key.owner_id,
      message.message_id,
      "sent",
      sendGridResponse.headers.get("x-message-id") ?? undefined,
    );
    const status = finished[0]?.message_status;
    return Response.json(
      { id: message.message_id, status: status ?? "unknown" },
      { status: status === "sent" ? 202 : 503 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
