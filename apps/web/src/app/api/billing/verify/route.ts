import { ApiError, errorResponse } from "@/lib/server/errors";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { verifyPaystackTransaction } from "@/lib/server/paystack";
import { database } from "@/lib/server/database";
import { requireUser, requireVerifiedEmail } from "@/lib/server/session";

type Topup = {
  id: string;
  reference: string;
  amount_kobo: number;
  status: "pending" | "credited" | "failed";
};

async function creditVerifiedTopup(ownerId: string, reference: string) {
  const sql = database();
  const rows = await sql<Topup[]>`
    select id, reference, amount_kobo, status from topups
    where reference = ${reference} and owner_id = ${ownerId} limit 1
  `;
  const topup = rows[0];
  if (!topup) throw new ApiError(404, "topup_not_found", "The top-up was not found.");
  if (topup.status === "credited") return { reference, status: "credited" as const };
  if (topup.status !== "pending")
    throw new ApiError(409, "topup_not_pending", "This top-up is no longer pending.");

  const transaction = await verifyPaystackTransaction(reference);
  if (
    transaction.status !== "success" ||
    transaction.reference !== reference ||
    transaction.amount !== Number(topup.amount_kobo) ||
    transaction.currency !== "NGN" ||
    !Number.isSafeInteger(transaction.id)
  ) {
    throw new ApiError(409, "payment_not_verified", "The payment is not yet verified.");
  }

  await sql`
    select credit_paystack_topup(
      ${reference}, ${String(transaction.id)}, ${transaction.amount}
    )
  `;
  return { reference, status: "credited" as const };
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await requireUser();
    requireVerifiedEmail(user);
    const body = await readJson(request);
    const reference = stringField(body, "reference", { max: 100 })!;
    if (!/^permitt_[0-9a-f]{32}$/i.test(reference)) {
      throw new ApiError(400, "invalid_reference", "The payment reference is invalid.");
    }
    return Response.json(await creditVerifiedTopup(user.id, reference));
  } catch (error) {
    return errorResponse(error);
  }
}

export { creditVerifiedTopup };
