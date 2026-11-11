import { neon } from "@neondatabase/serverless";
import { ApiError } from "./errors";

type DatabaseTag = <T = Record<string, unknown>[]>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T>;

export function database() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new ApiError(
      503,
      "service_not_configured",
      "Server setting DATABASE_URL is not configured.",
    );
  }
  return neon(connectionString) as unknown as DatabaseTag;
}
