import { randomUUID } from "node:crypto";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { paystackMaxTopupKobo, paystackMinTopupKobo, siteUrl } from "@/lib/server/env";
import { readJson, requireSameOrigin } from "@/lib/server/http";
import { initializePaystackTransaction } from "@/lib/server/paystack";
import { database } from "@/lib/server/database";
import { requireUser, requireVerifiedEmail } from "@/lib/server/session";

type CreatedTopup = { reference: string };

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await requireUser();
    requireVerifiedEmail(user);
    if (!user.email)
      throw new ApiError(400, "email_required", "Add an email address before creating a top-up.");

    const body = await readJson(request);
    const amountNgn = body.amountNgn;
    if (!Number.isSafeInteger(amountNgn)) {
      throw new ApiError(400, "invalid_amount", "Enter a whole-naira top-up amount.");
    }

    const amountKobo = Number(amountNgn) * 100;
    if (amountKobo < paystackMinTopupKobo() || amountKobo > paystackMaxTopupKobo()) {
      throw new ApiError(
        400,
        "amount_out_of_range",
        "The top-up amount is outside the configured limits.",
      );
    }

    const reference = `permitt_${randomUUID().replaceAll("-", "")}`;
    const sql = database();
    const topups = await sql<CreatedTopup[]>`
      insert into topups (owner_id, reference, amount_kobo)
      values (${user.id}, ${reference}, ${amountKobo}) returning reference
    `;
    if (!topups[0])
      throw new ApiError(503, "database_unavailable", "The top-up could not be created.");

    try {
      const transaction = await initializePaystackTransaction({
        email: user.email,
        reference,
        amountKobo,
        callbackUrl: `${siteUrl()}/dashboard?reference=${encodeURIComponent(reference)}`,
      });

      await sql`
        update topups set authorization_url = ${transaction.authorization_url}
        where reference = ${reference} and owner_id = ${user.id}
      `;
      return Response.json({
        reference,
        authorizationUrl: transaction.authorization_url,
      });
    } catch (error) {
      await sql`update topups set status = 'failed' where reference = ${reference} and owner_id = ${user.id}`;
      throw error;
    }
  } catch (error) {
    return errorResponse(error);
  }
}
