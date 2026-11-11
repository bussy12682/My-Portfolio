import { createHash } from "node:crypto";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { database } from "@/lib/server/database";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { requireUser, requireVerifiedEmail } from "@/lib/server/session";
import {
  buyAirtime,
  buyData,
  getAirtimeNetworks,
  getDataPlans,
  type ProviderResult,
} from "@/lib/server/telecom-abode";

type VtuOrder = {
  id: string;
  service: "airtime" | "data";
  provider_product_id: string;
  product_label: string;
  recipient: string;
  amount_kobo: string | number;
  status: string;
  provider_message: string | null;
  failure_reason: string | null;
  created_at: string;
};
type Reservation = {
  order_id: string | null;
  order_status: string | null;
  is_duplicate: boolean;
  error_code: string | null;
};
type FinishedOrder = { order_id: string; order_status: string };
type ExistingIdempotency = { id: string; request_hash: string };

function normalizedPhone(value: string) {
  const compact = value.replace(/[\s()-]/g, "");
  const local = compact.startsWith("+234")
    ? `0${compact.slice(4)}`
    : compact.startsWith("234")
      ? `0${compact.slice(3)}`
      : compact;
  if (!/^0[789]\d{9}$/.test(local)) {
    throw new ApiError(
      400,
      "invalid_phone",
      "Enter a valid Nigerian mobile number, such as 08012345678.",
    );
  }
  return local;
}

function amountKobo(amountNgn: unknown) {
  if (
    typeof amountNgn !== "number" ||
    !Number.isSafeInteger(amountNgn) ||
    amountNgn <= 0 ||
    amountNgn > 100_000_000
  ) {
    throw new ApiError(400, "invalid_amount", "Enter a positive whole-naira airtime amount.");
  }
  return amountNgn * 100;
}

function idempotencyKey(request: Request) {
  const key = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(key)) {
    throw new ApiError(
      400,
      "idempotency_key_required",
      "Provide an Idempotency-Key header (8–128 characters).",
    );
  }
  return key;
}

async function finalizeOrder(
  ownerId: string,
  orderId: string,
  result: ProviderResult,
): Promise<FinishedOrder | undefined> {
  const sql = database();
  const rows = await sql<FinishedOrder[]>`
    select * from finish_vtu_purchase(
      ${ownerId}, ${orderId}, ${result.status}, ${result.message || null},
      ${result.failureReason ?? null}
    )
  `;
  return rows[0];
}

async function orderById(ownerId: string, orderId: string) {
  const sql = database();
  const rows = await sql<VtuOrder[]>`
    select id, service, provider_product_id, product_label, recipient, amount_kobo,
           status, provider_message, failure_reason, created_at
    from vtu_orders where owner_id = ${ownerId} and id = ${orderId} limit 1
  `;
  return rows[0];
}

function orderResponse(order: VtuOrder, isDuplicate = false) {
  const responseStatus = order.status === "processing" || order.status === "unknown" ? 202 : 200;
  return Response.json(
    { order },
    {
      status: responseStatus,
      headers: {
        "Cache-Control": "no-store",
        ...(isDuplicate ? { "Idempotency-Replayed": "true" } : {}),
      },
    },
  );
}

export async function GET() {
  try {
    const user = await requireUser();
    const sql = database();
    const orders = await sql<VtuOrder[]>`
      select id, service, provider_product_id, product_label, recipient, amount_kobo,
             status, provider_message, failure_reason, created_at
      from vtu_orders where owner_id = ${user.id}
      order by created_at desc limit 20
    `;
    return Response.json({ orders }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await requireUser();
    requireVerifiedEmail(user);
    const key = idempotencyKey(request);
    const body = await readJson(request);
    const service = body.service;
    if (service !== "airtime" && service !== "data") {
      throw new ApiError(400, "invalid_service", "Choose either airtime or data.");
    }
    const phone = normalizedPhone(stringField(body, "phone", { max: 32 })!);
    const keyHash = createHash("sha256").update(key).digest("hex");

    let providerProductId: string;
    let productLabel: string;
    let totalKobo: number | undefined;
    let purchase: (requestId: string) => Promise<ProviderResult>;
    let requestShape: Record<string, string | number>;
    let requestedNetworkId: number | undefined;
    let requestedAmountNgn: number | undefined;
    let requestedPlanId: string | undefined;

    if (service === "airtime") {
      const networkId = body.networkId;
      if (typeof networkId !== "number" || !Number.isSafeInteger(networkId) || networkId <= 0) {
        throw new ApiError(400, "invalid_network", "Choose a valid airtime network.");
      }
      const amountNgn = body.amountNgn;
      if (typeof amountNgn !== "number") {
        throw new ApiError(400, "invalid_amount", "Enter a positive whole-naira airtime amount.");
      }
      totalKobo = amountKobo(amountNgn);
      requestedNetworkId = networkId;
      requestedAmountNgn = amountNgn;
      requestShape = { service, phone, networkId, amountNgn };
    } else {
      requestedPlanId = stringField(body, "planId", { max: 100 })!;
      requestShape = { service, phone, planId: requestedPlanId };
    }

    const requestBodyHash = createHash("sha256").update(JSON.stringify(requestShape)).digest("hex");
    const sql = database();
    const existing = await sql<ExistingIdempotency[]>`
      select id, request_hash from vtu_orders
      where owner_id = ${user.id} and idempotency_key_hash = ${keyHash} limit 1
    `;
    if (existing[0]) {
      if (existing[0].request_hash !== requestBodyHash) {
        throw new ApiError(
          409,
          "idempotency_conflict",
          "This Idempotency-Key was already used for a different purchase.",
        );
      }
      const order = await orderById(user.id, existing[0].id);
      if (!order) {
        throw new ApiError(503, "purchase_unavailable", "The purchase status could not be loaded.");
      }
      return orderResponse(order, true);
    }

    if (service === "airtime") {
      if (requestedNetworkId === undefined || requestedAmountNgn === undefined) {
        throw new ApiError(400, "invalid_airtime", "The airtime request is incomplete.");
      }
      const networkId = requestedNetworkId;
      const amountNgn = requestedAmountNgn;
      const networks = await getAirtimeNetworks();
      const network = networks.find((candidate) => candidate.id === networkId);
      if (!network) {
        throw new ApiError(
          400,
          "invalid_network",
          "That airtime network is not currently available.",
        );
      }
      providerProductId = String(network.id);
      productLabel = `${network.name} airtime`;
      purchase = (requestId) => buyAirtime({ network: network.id, phone, amountNgn, requestId });
    } else {
      if (!requestedPlanId) {
        throw new ApiError(400, "invalid_plan", "Choose a data plan.");
      }
      const planId = requestedPlanId;
      const plans = await getDataPlans();
      const plan = plans.find((candidate) => candidate.id === planId);
      if (!plan) {
        throw new ApiError(400, "invalid_plan", "That data plan is not currently available.");
      }
      providerProductId = plan.id;
      productLabel = plan.description;
      totalKobo = plan.priceKobo;
      purchase = (requestId) => buyData({ phone, plan: plan.id, requestId });
    }

    if (totalKobo === undefined) {
      throw new ApiError(
        502,
        "invalid_provider_price",
        "The provider price could not be verified.",
      );
    }

    const reservations = await sql<Reservation[]>`
      select * from reserve_vtu_purchase(
        ${user.id}, 'telecom_abode', ${service}, ${providerProductId},
        ${productLabel}, ${phone}, ${totalKobo}, ${keyHash}, ${requestBodyHash}
      )
    `;
    const reservation = reservations[0];
    if (!reservation) {
      throw new ApiError(503, "purchase_unavailable", "The purchase could not be reserved.");
    }
    if (reservation.error_code === "insufficient_balance") {
      throw new ApiError(402, "insufficient_balance", "Your wallet balance is too low.");
    }
    if (reservation.error_code === "idempotency_conflict") {
      throw new ApiError(
        409,
        "idempotency_conflict",
        "This Idempotency-Key was already used for a different purchase.",
      );
    }
    if (!reservation.order_id || !reservation.order_status) {
      throw new ApiError(503, "purchase_unavailable", "The purchase could not be reserved.");
    }

    if (!reservation.is_duplicate) {
      const providerResult = await purchase(reservation.order_id);
      await finalizeOrder(user.id, reservation.order_id, providerResult);
    }

    const order = await orderById(user.id, reservation.order_id);
    if (!order) {
      throw new ApiError(503, "purchase_unavailable", "The purchase status could not be loaded.");
    }
    return orderResponse(order, reservation.is_duplicate);
  } catch (error) {
    return errorResponse(error);
  }
}
