import { ApiError, errorResponse } from "@/lib/server/errors";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { database } from "@/lib/server/database";
import { sendAccountToken } from "@/lib/server/account-tokens";
import { hashPassword } from "@/lib/server/password";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const name = stringField(body, "name", { min: 2, max: 100 })!;
    const email = stringField(body, "email", { max: 254 })!.toLowerCase();
    const password = stringField(body, "password", { min: 12, max: 128 })!;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "invalid_email", "Enter a valid email address.");
    }

    const sql = database();
    const existing = await sql`select id from users where email = ${email} limit 1`;
    if (existing[0])
      throw new ApiError(409, "account_exists", "An account with that email already exists.");
    const userId = randomUUID();
    await sql`select create_account(
      ${userId}::uuid, ${email}, ${await hashPassword(password)}, ${name}
    )`;
    await sendAccountToken({ userId, email, purpose: "verify_email" });
    return Response.json({
      ok: true,
      confirmationRequired: true,
      message: "Check your inbox for a verification link before signing in.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
