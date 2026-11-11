import { ApiError, errorResponse } from "@/lib/server/errors";
import { verifyPaystackSignature, verifyPaystackTransaction } from "@/lib/server/paystack";
import { database } from "@/lib/server/database";
import { creditVerifiedTopup } from "../../verify/route";

type WebhookEvent = {
  event?: string;
  data?: { reference?: string };
};
type Topup = { reference: string; owner_id: string; status: string };

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 64_000) {
      throw new ApiError(413, "request_too_large", "The webhook payload is too large.");
    }
    if (!verifyPaystackSignature(rawBody, request.headers.get("x-paystack-signature"))) {
      throw new ApiError(401, "invalid_signature", "The payment signature is invalid.");
    }

    let event: WebhookEvent;
    try {
      event = JSON.parse(rawBody) as WebhookEvent;
    } catch {
      throw new ApiError(400, "invalid_payload", "The webhook payload is not valid JSON.");
    }
    if (event.event !== "charge.success") return Response.json({ received: true });

    const reference = event.data?.reference;
    if (!reference || !/^permitt_[0-9a-f]{32}$/i.test(reference)) {
      throw new ApiError(400, "invalid_reference", "The payment reference is invalid.");
    }
    const sql = database();
    const topups = await sql<Topup[]>`
      select reference, owner_id, status from topups where reference = ${reference} limit 1
    `;
    const topup = topups[0];
    if (!topup || topup.status === "credited") return Response.json({ received: true });

    const verified = await verifyPaystackTransaction(reference);
    if (verified.status !== "success") return Response.json({ received: true });

    await creditVerifiedTopup(topup.owner_id, reference);
    return Response.json({ received: true });
  } catch (error) {
    return errorResponse(error);
  }
}
