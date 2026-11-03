import { createHmac, timingSafeEqual } from "node:crypto";
import { ApiError } from "./errors";
import { paystackSecretKey } from "./env";

type PaystackEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type VerifiedPaystackTransaction = {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
};

async function paystackRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`https://api.paystack.co/${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${paystackSecretKey()}`,
      "content-type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const envelope = (await response.json().catch(() => null)) as PaystackEnvelope<T> | null;
  if (!response.ok || !envelope?.status || !envelope.data) {
    console.error("Paystack request failed", { status: response.status, path });
    throw new ApiError(503, "payment_provider_unavailable", "The payment provider is temporarily unavailable.");
  }
  return envelope.data;
}

export async function initializePaystackTransaction(input: {
  email: string;
  reference: string;
  amountKobo: number;
  callbackUrl: string;
}) {
  return paystackRequest<{ authorization_url: string; access_code: string; reference: string }>(
    "transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        currency: "NGN",
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: { product: "permitt_wallet_topup" },
      }),
    },
  );
}

export async function verifyPaystackTransaction(reference: string) {
  return paystackRequest<VerifiedPaystackTransaction>(
    `transaction/verify/${encodeURIComponent(reference)}`,
    { method: "GET" },
  );
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", paystackSecretKey()).update(rawBody).digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
