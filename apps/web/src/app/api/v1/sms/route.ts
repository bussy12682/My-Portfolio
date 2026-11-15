import { createHash } from "node:crypto";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { smsPricePerPageKobo, telecomAbodeApiKey, telecomAbodeSmsSenderId } from "@/lib/server/env";
import { database } from "@/lib/server/database";
import { getSmsReport, sendBulkSms } from "@/lib/server/telecom-abode";
import { readJson, stringField } from "@/lib/server/http";

type ApiKeyRow = {
  id: string;
  project_id: string;
  owner_id: string;
  revoked_at: string | null;
};
type SmsReservation = {
  message_id: string;
  message_status: string;
  is_duplicate: boolean;
};
type SmsMessageRow = {
  id: string;
  status: string;
  provider_request_id: string | null;
  amount_kobo: string | number;
  recipient_count: number;
  pages_per_recipient: number;
};

const GSM7_BASIC = new Set(
  Array.from(
    `@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà`,
  ),
);
const GSM7_EXTENSION = new Set(Array.from("^{}\\[~]|€\f"));
const MAX_RECIPIENTS = 50;
const MAX_MESSAGE_LENGTH = 480;

function authorizationKey(request: Request) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]?.trim()) {
    throw new ApiError(401, "invalid_api_key", "Provide a valid Permitt API key.");
  }
  return match[1].trim();
}

function normalizeRecipient(value: unknown) {
  if (typeof value !== "string") {
    throw new ApiError(400, "invalid_recipient", "Every `to` entry must be a phone number.");
  }
  const phone = value.replace(/[\s()-]/g, "");
  const match = phone.match(/^(?:0\d{10}|\+?234\d{10})$/);
  if (!match) {
    throw new ApiError(
      400,
      "invalid_recipient",
      "Recipients must be Nigerian mobile numbers in 08012345678 or +2348012345678 format.",
    );
  }
  return phone.startsWith("0") ? phone : `0${phone.slice(-10)}`;
}

function messagePages(message: string) {
  let septets = 0;
  for (const character of message) {
    if (GSM7_BASIC.has(character)) {
      septets += 1;
    } else if (GSM7_EXTENSION.has(character)) {
      septets += 2;
    } else {
      throw new ApiError(
        400,
        "unsupported_character",
        "SMS text must use GSM-7 characters. Remove emoji and unsupported Unicode characters.",
      );
    }
  }
  const pages = Math.max(1, Math.ceil(septets / 160));
  if (pages > 3) {
    throw new ApiError(400, "message_too_long", "SMS messages are limited to 480 characters.");
  }
  return pages;
}

function translateReservationError(error: unknown): never {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("insufficient_balance")) {
    throw new ApiError(402, "insufficient_balance", "Your wallet does not have enough credits.");
  }
  if (message.includes("daily_limit_exceeded")) {
    throw new ApiError(
      429,
      "daily_limit_exceeded",
      "This API key has reached its daily request limit.",
    );
  }
  if (message.includes("idempotency_conflict")) {
    throw new ApiError(
      409,
      "idempotency_conflict",
      "This Idempotency-Key was already used with a different SMS request.",
    );
  }
  if (message.includes("api_key_revoked")) {
    throw new ApiError(401, "invalid_api_key", "The API key is invalid or revoked.");
  }
  throw error;
}

async function findApiKey(rawKey: string) {
  const sql = database();
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keys = await sql<ApiKeyRow[]>`
    select id, project_id, owner_id, revoked_at from api_keys
    where key_hash = ${keyHash} and revoked_at is null limit 1
  `;
  const key = keys[0];
  if (!key || key.revoked_at) {
    throw new ApiError(401, "invalid_api_key", "The API key is invalid or revoked.");
  }
  return { key, sql };
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

    const body = await readJson(request, 32_000);
    if (body.consentConfirmed !== true) {
      throw new ApiError(
        400,
        "recipient_consent_required",
        "Set `consentConfirmed` to true only when every recipient has agreed to receive these messages.",
      );
    }
    if (!Array.isArray(body.to) || body.to.length < 1 || body.to.length > MAX_RECIPIENTS) {
      throw new ApiError(
        400,
        "invalid_recipient_count",
        `Provide between 1 and ${MAX_RECIPIENTS} recipients in the \`to\` array.`,
      );
    }
    const recipients = body.to.map(normalizeRecipient);
    if (new Set(recipients).size !== recipients.length) {
      throw new ApiError(
        400,
        "duplicate_recipient",
        "The `to` array cannot contain duplicate numbers.",
      );
    }

    const message = stringField(body, "message", { max: MAX_MESSAGE_LENGTH })!;
    const pages = messagePages(message);
    const senderId = telecomAbodeSmsSenderId();
    const pricePerPage = smsPricePerPageKobo();
    telecomAbodeApiKey();
    const amountKobo = pricePerPage * pages * recipients.length;
    if (!Number.isSafeInteger(amountKobo)) {
      throw new ApiError(
        400,
        "message_cost_too_large",
        "The SMS request cost exceeds the supported limit.",
      );
    }

    const { key, sql } = await findApiKey(rawKey);
    await sql`update api_keys set last_used_at = now() where id = ${key.id} and revoked_at is null`;
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ recipients, message, senderId, consentConfirmed: true }))
      .digest("hex");

    let reservations: SmsReservation[];
    try {
      reservations = await sql<SmsReservation[]>`
        select * from reserve_sms_send(
          ${key.owner_id}, ${key.project_id}, ${key.id}, ${idempotencyKey},
          ${requestHash}, ${senderId}, ${recipients.length}, ${pages}, ${amountKobo}
        )
      `;
    } catch (error) {
      translateReservationError(error);
    }
    const reservation = reservations[0];
    if (!reservation) {
      throw new ApiError(503, "send_unavailable", "The SMS request could not be reserved.");
    }

    const smsRows = await sql<SmsMessageRow[]>`
      select id, status, provider_request_id, amount_kobo, recipient_count, pages_per_recipient
      from sms_messages where id = ${reservation.message_id}
    `;
    const reservedSms = smsRows[0];
    if (!reservedSms) {
      throw new ApiError(
        503,
        "send_unavailable",
        "The SMS request reservation could not be loaded.",
      );
    }
    if (reservation.is_duplicate) {
      const responseStatus =
        reservedSms.status === "accepted"
          ? 200
          : reservedSms.status === "processing"
            ? 202
            : reservedSms.status === "failed"
              ? 502
              : 503;
      return Response.json(
        {
          id: reservedSms.id,
          status: reservedSms.status,
          providerRequestId: reservedSms.provider_request_id,
          amountKobo: Number(reservedSms.amount_kobo),
          recipientCount: reservedSms.recipient_count,
          pagesPerRecipient: reservedSms.pages_per_recipient,
        },
        { status: responseStatus, headers: { "Idempotency-Replayed": "true" } },
      );
    }

    const result = await sendBulkSms({ senderId, recipients, message });
    const finalStatus = result.status;
    const finished = await sql`
      select * from finish_sms_send(
        ${key.owner_id}, ${reservation.message_id}, ${finalStatus},
        ${result.requestId ?? null},
        ${finalStatus === "failed" ? "provider_rejected" : finalStatus === "unknown" ? "provider_response_unknown" : null}
      )
    `;
    if (!finished.length) {
      throw new ApiError(
        503,
        "send_status_unavailable",
        "The SMS provider result could not be recorded.",
      );
    }

    if (finalStatus === "failed") {
      throw new ApiError(
        502,
        "provider_rejected",
        "Telecom Abode rejected the SMS request; the reserved wallet credit was returned.",
      );
    }
    if (finalStatus === "unknown") {
      throw new ApiError(
        503,
        "delivery_status_unknown",
        "Telecom Abode did not confirm the SMS request. The reserved amount remains held; check the request status before retrying.",
      );
    }

    return Response.json(
      {
        id: reservation.message_id,
        status: "accepted",
        providerRequestId: result.requestId,
        amountKobo,
        recipientCount: recipients.length,
        pagesPerRecipient: pages,
      },
      { status: 202 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    const rawKey = authorizationKey(request);
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      throw new ApiError(
        400,
        "invalid_message_id",
        "Provide a valid SMS message ID in the `id` query parameter.",
      );
    }

    const { key, sql } = await findApiKey(rawKey);
    const rows = await sql<SmsMessageRow[]>`
      select id, status, provider_request_id, amount_kobo, recipient_count, pages_per_recipient
      from sms_messages
      where id = ${id} and project_id = ${key.project_id} and api_key_id = ${key.id}
      limit 1
    `;
    const sms = rows[0];
    if (!sms) {
      throw new ApiError(
        404,
        "message_not_found",
        "The SMS message was not found for this API key.",
      );
    }
    if (!sms.provider_request_id) {
      return Response.json({
        id: sms.id,
        status: sms.status,
        providerRequestId: sms.provider_request_id,
        amountKobo: Number(sms.amount_kobo),
        recipientCount: sms.recipient_count,
        pagesPerRecipient: sms.pages_per_recipient,
        deliveryReports: [],
      });
    }

    const deliveryReports = await getSmsReport(sms.provider_request_id);
    return Response.json({
      id: sms.id,
      status: sms.status,
      providerRequestId: sms.provider_request_id,
      amountKobo: Number(sms.amount_kobo),
      recipientCount: sms.recipient_count,
      pagesPerRecipient: sms.pages_per_recipient,
      deliveryReports,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
