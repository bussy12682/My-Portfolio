import { ApiError, errorResponse } from "@/lib/server/errors";
import { database } from "@/lib/server/database";
import { hashAccountToken } from "@/lib/server/account-tokens";
import { hashPassword } from "@/lib/server/password";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { setSession } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const token = stringField(body, "token", { max: 128 })!;
    const password = stringField(body, "password", { min: 12, max: 128 })!;
    const passwordHash = await hashPassword(password);
    const sql = database();
    const rows = await sql<{ user_id: string | null }[]>`
      select reset_account_password(${hashAccountToken(token)}, ${passwordHash}) as user_id
    `;
    const userId = rows[0]?.user_id;
    if (!userId) {
      throw new ApiError(
        400,
        "invalid_reset_token",
        "This password reset link is invalid or has expired.",
      );
    }
    await setSession(userId);
    return Response.json({ ok: true, redirectTo: "/dashboard" });
  } catch (error) {
    return errorResponse(error);
  }
}
