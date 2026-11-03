import { ApiError } from "./errors";
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from "./env";

type SupabaseError = {
  message?: string;
  code?: string;
};

async function responseJson<T>(response: Response, service: "auth" | "database"): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return null as T;
    return (await response.json()) as T;
  }

  const failure = (await response.json().catch(() => null)) as SupabaseError | null;
  const message = failure?.message ?? "";
  if (service === "database" && message === "insufficient_balance") {
    throw new ApiError(402, message, "Your Permitt balance is too low. Add credits before sending.");
  }
  if (service === "database" && message === "daily_limit_exceeded") {
    throw new ApiError(429, message, "This API key has reached its daily sending limit.");
  }
  if (service === "database" && message === "idempotency_conflict") {
    throw new ApiError(409, message, "That idempotency key was already used for a different request.");
  }
  if (service === "database" && message === "api_key_revoked") {
    throw new ApiError(401, message, "The API key is no longer active.");
  }
  if (service === "database" && message === "message_not_found") {
    throw new ApiError(404, message, "The message was not found.");
  }
  if (service === "database" && ["topup_amount_mismatch", "topup_not_pending"].includes(message)) {
    throw new ApiError(409, message, "The payment could not be applied to this wallet.");
  }

  if (service === "auth" && [400, 401, 422].includes(response.status)) {
    const invalidLogin = response.status === 400 || response.status === 401;
    throw new ApiError(
      invalidLogin ? 401 : 400,
      "authentication_failed",
      invalidLogin ? "Invalid email or password." : "The account details could not be accepted.",
    );
  }
  if (service === "auth" && response.status === 429) {
    throw new ApiError(429, "too_many_requests", "Too many account requests. Please try again later.");
  }

  console.error(`Supabase ${service} request failed`, {
    status: response.status,
    code: failure?.code,
    message: failure?.message,
  });
  throw new ApiError(503, "database_unavailable", "The account service is temporarily unavailable.");
}

export async function authRequest<T>(
  path: string,
  init: RequestInit,
  accessToken?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("apikey", supabaseAnonKey());
  headers.set("content-type", "application/json");
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${supabaseUrl()}/auth/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  return responseJson<T>(response, "auth");
}

export async function databaseRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const key = supabaseServiceRoleKey();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("authorization", `Bearer ${key}`);
  headers.set("content-type", "application/json");

  const response = await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  return responseJson<T>(response, "database");
}

export function databaseUrl(table: string, filters: Record<string, string>) {
  const query = new URLSearchParams(filters);
  return `${table}?${query.toString()}`;
}
