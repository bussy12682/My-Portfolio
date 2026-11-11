import { createHash } from "node:crypto";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { emailPriceKobo, resendApiKey, resendFromEmail } from "@/lib/server/env";
import { database } from "@/lib/server/database";
import { sendEmail } from "@/lib/server/resend";
import { readJson, stringField } from "@/lib/server/http";

type ApiKeyRow = {
  id: string;
  project_id: string;
  owner_id: string;
  revoked_at: string | null;
};
type Reservation = { message_id: string; message_status: string; is_duplicate: boolean };
type FinishedMessage = { message_id: string; message_status: string };

function isEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function authorizationKey(request: Request) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]?.trim()) {
    throw new ApiError(401, "invalid_api_key", "Provide a valid Permitt API key.");
  }
  return match[1].trim();
}

async function finishMessage(
  ownerId: string,
  messageId: string,
  status: "sent" | "failed" | "unknown",
  providerMessageId?: string,
  failureReason?: string,
) {
  const sql = database();
  return sql<FinishedMessage[]>`
    select * from finish_email_send(
      ${ownerId}, ${messageId}, ${status}, ${providerMessageId ?? null}, ${failureReason ?? null}
    )
  `;
}

export async function POST(request: Request) {
  try {
    const rawKey = authorizationKey(request);
    const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
    if (!/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
      throw new ApiError(
        400,
        "idempotency_key_required",
        "Provide an Idempotency-Key header (8–128 characters).",
      );
    }

    const body = await readJson(request, 96_000);
    const recipient = stringField(body, "to", { max: 254 })!.toLowerCase();
    const subject = stringField(body, "subject", { max: 200 })!;
    const text = stringField(body, "text", { max: 40_000, optional: true });
    const html = stringField(body, "html", { max: 40_000, optional: true });
    if (!isEmail(recipient)) {
      throw new ApiError(400, "invalid_recipient", "The `to` field must be a valid email address.");
    }
    if (!text && !html) {
      throw new ApiError(400, "missing_content", "Provide a `text` or `html` message body.");
    }
    if (/[\r\n]/.test(subject)) {
      throw new ApiError(400, "invalid_subject", "The subject cannot contain line breaks.");
    }

    const from = resendFromEmail();
    resendApiKey();
    const price = emailPriceKobo();
    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    const sql = database();
    const keys = await sql<ApiKeyRow[]>`
      select id, project_id, owner_id, revoked_at from api_keys
      where key_hash = ${keyHash} and revoked_at is null limit 1
    `;
    const key = keys[0];
    if (!key || key.revoked_at) {
      throw new ApiError(401, "invalid_api_key", "The API key is invalid or revoked.");
    }

    await sql`update api_keys set last_used_at = now() where id = ${key.id} and revoked_at is null`;
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ to: recipient, subject, text: text ?? null, html: html ?? null }))
      .digest("hex");
    const reservation = await sql<Reservation[]>`
      select * from reserve_email_send(
        ${key.owner_id}, ${key.project_id}, ${key.id}, ${idempotencyKey},
        ${requestHash}, ${from}, ${recipient}, ${subject}, ${text ?? null},
        ${html ?? null}, ${price}
      )
    `;
    const message = reservation[0];
    if (!message) {
      throw new ApiError(503, "send_unavailable", "The email request could not be reserved.");
    }
    if (message.is_duplicate) {
      const status = message.message_status;
      const responseStatus =
        status === "sent" ? 200 : status === "processing" ? 202 : status === "failed" ? 502 : 503;
      return Response.json(
        { id: message.message_id, status },
        { status: responseStatus, headers: { "Idempotency-Replayed": "true" } },
      );
    }

    let providerMessageId: string;
    try {
      const sent = await sendEmail({
        to: recipient,
        subject,
        text: text ?? "",
        html,
        idempotencyKey: `permitt-${message.message_id}`,
      });
      providerMessageId = sent.id;
    } catch (error) {
      if (error instanceof ApiError && error.code === "email_provider_rejected") {
        await finishMessage(
          key.owner_id,
          message.message_id,
          "failed",
          undefined,
          "resend_rejected",
        );
        throw new ApiError(
          502,
          "provider_rejected",
          "The email provider rejected the message; the reserved credit was returned.",
        );
      }
      await finishMessage(
        key.owner_id,
        message.message_id,
        "unknown",
        undefined,
        "provider_response_unknown",
      );
      throw new ApiError(
        503,
        "delivery_status_unknown",
        "The provider response was not received. Check the message log before retrying with a new key.",
      );
    }

    const finished = await finishMessage(
      key.owner_id,
      message.message_id,
      "sent",
      providerMessageId,
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
