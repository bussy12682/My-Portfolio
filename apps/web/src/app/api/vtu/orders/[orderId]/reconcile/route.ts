import { ApiError, errorResponse } from "@/lib/server/errors";
import { database } from "@/lib/server/database";
import { requireSameOrigin } from "@/lib/server/http";
import { requireUser, requireVerifiedEmail } from "@/lib/server/session";
import { getTransactionStatus, type ProviderResult } from "@/lib/server/telecom-abode";

type VtuOrder = {
  id: string;
  status: string;
};
type FinishedOrder = { order_id: string; order_status: string };

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  try {
    requireSameOrigin(request);
    const user = await requireUser();
    requireVerifiedEmail(user);
    const { orderId } = await context.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      throw new ApiError(400, "invalid_order", "The purchase ID is invalid.");
    }

    const sql = database();
    const orders = await sql<VtuOrder[]>`
      select id, status from vtu_orders
      where id = ${orderId} and owner_id = ${user.id} limit 1
    `;
    const order = orders[0];
    if (!order) throw new ApiError(404, "order_not_found", "The purchase could not be found.");
    if (order.status === "successful" || order.status === "failed") {
      return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
    }

    const providerResult: ProviderResult = await getTransactionStatus(order.id);
    const finished = await sql<FinishedOrder[]>`
      select * from finish_vtu_purchase(
        ${user.id}, ${order.id}, ${providerResult.status}, ${providerResult.message || null},
        ${providerResult.failureReason ?? null}
      )
    `;
    if (!finished[0]) {
      throw new ApiError(
        503,
        "reconciliation_unavailable",
        "The purchase status could not be updated.",
      );
    }
    const updated = await sql<VtuOrder[]>`
      select id, status from vtu_orders where id = ${order.id} and owner_id = ${user.id} limit 1
    `;
    return Response.json({ order: updated[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
