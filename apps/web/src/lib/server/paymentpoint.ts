import { createHmac, timingSafeEqual } from "node:crypto";
import { ApiError } from "./errors";
import { paymentPointApiKey, paymentPointBusinessId, paymentPointSecretKey } from "./env";

const API_BASE = "https://api.paymentpoint.co/api/v1";
const PROVIDER_TIMEOUT_MS = 15_000;

export type PaymentPointAccount = {
  accountNumber: string;
  accountName: string;
  bankName: string;
  reservedAccountId: string | null;
};

function objectValue(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function safeProviderText(value: string) {
  return value
    .slice(0, 200)
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b|\+?\d[\d\s().-]{8,}\d/g, "[redacted]");
}

function providerErrors(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 5).map((entry) => {
    if (typeof entry === "string") return safeProviderText(entry);
    const error = objectValue(entry);
    if (!error) return typeof entry;
    return Object.fromEntries(
      ["bankCode", "code", "message", "error"]
        .filter((field) => typeof error[field] === "string")
        .map((field) => [field, safeProviderText(String(error[field]))]),
    );
  });
}

export async function createPaymentPointAccounts(input: {
  email: string;
  name: string;
  phoneNumber: string;
}) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/createVirtualAccount`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      headers: {
        authorization: `Bearer ${paymentPointSecretKey()}`,
        "api-key": paymentPointApiKey(),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        name: input.name,
        phoneNumber: input.phoneNumber,
        bankCode: ["20897"],
        businessId: paymentPointBusinessId(),
      }),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      503,
      "payment_provider_unavailable",
      "PaymentPoint could not be reached. Please try again.",
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    console.error("PaymentPoint returned a non-JSON virtual account response", {
      statusCode: response.status,
      contentType: response.headers.get("content-type"),
    });
    throw new ApiError(
      502,
      "payment_provider_invalid_response",
      "PaymentPoint returned an invalid response.",
    );
  }

  const result = objectValue(body);
  const status = String(result?.status ?? "").toLowerCase();
  if (!response.ok || status !== "success") {
    console.error("PaymentPoint virtual account request failed", {
      statusCode: response.status,
      providerStatus: status || undefined,
      responseKeys: result ? Object.keys(result).slice(0, 20) : [],
    });
    throw new ApiError(
      502,
      "payment_provider_rejected",
      "PaymentPoint could not create your transfer account. Please try again.",
    );
  }

  const customer = objectValue(result?.customer);
  const bankAccounts = Array.isArray(result?.bankAccounts)
    ? result.bankAccounts
        .map((value): PaymentPointAccount | null => {
          const account = objectValue(value);
          const accountNumber = String(account?.accountNumber ?? "").replace(/\D/g, "");
          const accountName = typeof account?.accountName === "string" ? account.accountName : "";
          const bankName = typeof account?.bankName === "string" ? account.bankName : "";
          const reservedAccountId =
            typeof account?.Reserved_Account_Id === "string" ? account.Reserved_Account_Id : null;
          if (!/^\d{10}$/.test(accountNumber) || !accountName || !bankName) return null;
          return { accountNumber, accountName, bankName, reservedAccountId };
        })
        .filter((account): account is PaymentPointAccount => account !== null)
    : [];

  if (!bankAccounts.length) {
    const rawAccounts = Array.isArray(result?.bankAccounts) ? result.bankAccounts : [];
    const firstBankAccount = objectValue(rawAccounts[0]);
    const business = objectValue(result?.business);
    const rawErrors = result?.errors;
    console.error("PaymentPoint returned no usable virtual accounts", {
      statusCode: response.status,
      providerStatus: status,
      providerMessage:
        typeof result?.message === "string" ? safeProviderText(result.message) : undefined,
      responseKeys: result ? Object.keys(result).slice(0, 20) : [],
      bankAccountsType: Array.isArray(result?.bankAccounts) ? "array" : typeof result?.bankAccounts,
      bankAccountCount: rawAccounts.length,
      firstBankAccountKeys: firstBankAccount ? Object.keys(firstBankAccount).slice(0, 20) : [],
      customerKeys: customer ? Object.keys(customer).slice(0, 20) : [],
      businessKeys: business ? Object.keys(business).slice(0, 20) : [],
      errorsType: Array.isArray(rawErrors) ? "array" : typeof rawErrors,
      providerErrorCount: Array.isArray(rawErrors) ? rawErrors.length : undefined,
      providerErrors: providerErrors(result?.errors),
    });
    throw new ApiError(
      502,
      "payment_provider_invalid_response",
      "PaymentPoint did not return a usable transfer account.",
    );
  }

  return {
    customerId: typeof customer?.customer_id === "string" ? customer.customer_id : null,
    accounts: bankAccounts,
  };
}

export function verifyPaymentPointSignature(rawBody: string, signature: string | null) {
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", paymentPointSecretKey()).update(rawBody).digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
