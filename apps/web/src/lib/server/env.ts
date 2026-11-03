import { ApiError } from "./errors";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ApiError(503, "service_not_configured", `Server setting ${name} is not configured.`);
  }
  return value;
}

export function supabaseUrl() {
  const value = required("SUPABASE_URL").replace(/\/+$/, "");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new ApiError(503, "service_not_configured", "SUPABASE_URL must use HTTPS.");
  }
  return value;
}

export function supabaseAnonKey() {
  return required("SUPABASE_ANON_KEY");
}

export function supabaseServiceRoleKey() {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}

export function siteUrl() {
  const value = required("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new ApiError(503, "service_not_configured", "NEXT_PUBLIC_SITE_URL must use HTTPS.");
  }
  return value;
}

export function emailPriceKobo() {
  const value = Number(required("EMAIL_PRICE_KOBO"));
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new ApiError(503, "service_not_configured", "EMAIL_PRICE_KOBO must be a positive integer.");
  }
  return value;
}

export function emailDailyLimit() {
  const value = Number(process.env.EMAIL_DAILY_LIMIT ?? "20");
  if (!Number.isInteger(value) || value < 1 || value > 1000) {
    throw new ApiError(503, "service_not_configured", "EMAIL_DAILY_LIMIT must be between 1 and 1000.");
  }
  return value;
}

export function paystackMinTopupKobo() {
  return ngnLimitKobo("PAYSTACK_MIN_TOPUP_NGN");
}

export function paystackMaxTopupKobo() {
  return ngnLimitKobo("PAYSTACK_MAX_TOPUP_NGN");
}

function ngnLimitKobo(name: string) {
  const value = Number(required(name));
  if (!Number.isSafeInteger(value) || value < 1 || value > 100_000_000) {
    throw new ApiError(503, "service_not_configured", `${name} must be a positive whole-naira amount.`);
  }
  return value * 100;
}

export function sendGridApiKey() {
  return required("SENDGRID_API_KEY");
}

export function sendGridFrom() {
  const value = required("SENDGRID_FROM_EMAIL").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new ApiError(503, "service_not_configured", "SENDGRID_FROM_EMAIL is not a valid address.");
  }
  return value;
}

export function sendGridFromName() {
  return process.env.SENDGRID_FROM_NAME?.trim() || "Permitt by REKTINA";
}

export function paystackSecretKey() {
  return required("PAYSTACK_SECRET_KEY");
}
