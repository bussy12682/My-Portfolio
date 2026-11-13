import { ApiError, errorResponse } from "@/lib/server/errors";
import { database } from "@/lib/server/database";
import { verifyPaymentPointSignature } from "@/lib/server/paymentpoint";

type WebhookEvent = {
  transaction_id?: string | number;
  amount_paid?: number | string;
  transaction_status?: string;
  receiver?: { account_number?: string };
};

function amountInKobo(value: number | string | undefined) {
  const amount = typeof value === "number" ? value : Number(value);
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    Math.abs(amount * 100 - Math.round(amount * 100)) > 0.001
  ) {
    throw new ApiError(400, "invalid_amount", "The payment amount is invalid.");
  }
  const kobo = Math.round(amount * 100);
  if (!Number.isSafeInteger(kobo)) {
    throw new ApiError(400, "invalid_amount", "The payment amount is invalid.");
  }
  return kobo;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 64_000) {
      throw new ApiError(413, "request_too_large", "The webhook payload is too large.");
    }
    if (
      !verifyPaymentPointSignature(
        rawBody,
        request.headers.get("paymentpoint-signature") ??
          request.headers.get("payment-point-signature"),
      )
    ) {
      throw new ApiError(401, "invalid_signature", "The payment signature is invalid.");
    }

    let event: WebhookEvent;
    try {
      event = JSON.parse(rawBody) as WebhookEvent;
    } catch {
      throw new ApiError(400, "invalid_payload", "The webhook payload is not valid JSON.");
    }

    const transactionStatus = event.transaction_status?.trim().toLowerCase();
    if (!transactionStatus) {
      throw new ApiError(400, "invalid_payload", "The payment notification has no status.");
    }
    if (transactionStatus !== "success") {
      return Response.json({ received: true });
    }

    const transactionId = String(event.transaction_id ?? "").trim();
    const accountNumber = String(event.receiver?.account_number ?? "").replace(/\D/g, "");
    if (!transactionId || transactionId.length > 200 || !/^\d{10}$/.test(accountNumber)) {
      throw new ApiError(400, "invalid_payload", "The payment notification is incomplete.");
    }
    const amountKobo = amountInKobo(event.amount_paid);
    const sql = database();
    await sql`
      select credit_paymentpoint_deposit(
        ${transactionId}, ${accountNumber}, ${amountKobo}
      )
    `;
    return Response.json({ received: true });
  } catch (error) {
    return errorResponse(error);
  }
}
