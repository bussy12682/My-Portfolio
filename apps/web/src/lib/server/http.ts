import { ApiError } from "./errors";

export async function readJson(request: Request, maxBytes = 32_000): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new ApiError(415, "unsupported_media_type", "Send the request as application/json.");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) {
    throw new ApiError(413, "request_too_large", "The request body is too large.");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new ApiError(413, "request_too_large", "The request body is too large.");
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ApiError(400, "invalid_json", "The request body must be valid JSON.");
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, "invalid_json", "The request body must be a JSON object.");
  }

  return value as Record<string, unknown>;
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new ApiError(403, "invalid_origin", "The request origin is not allowed.");
  }
}

export function stringField(
  body: Record<string, unknown>,
  name: string,
  options: { min?: number; max: number; optional?: boolean } ,
) {
  const value = body[name];
  if (value === undefined && options.optional) return undefined;
  if (typeof value !== "string") {
    throw new ApiError(400, "invalid_input", `${name} must be a string.`);
  }
  const normalized = value.trim();
  if (
    normalized.length < (options.min ?? 1) ||
    normalized.length > options.max
  ) {
    throw new ApiError(400, "invalid_input", `${name} must be between ${options.min ?? 1} and ${options.max} characters.`);
  }
  return normalized;
}
