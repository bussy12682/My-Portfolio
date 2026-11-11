import { ApiError, errorResponse } from "@/lib/server/errors";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { setSession } from "@/lib/server/session";
import { database } from "@/lib/server/database";
import { verifyPassword } from "@/lib/server/password";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const email = stringField(body, "email", { max: 254 })!.toLowerCase();
    const password = stringField(body, "password", { max: 128 })!;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "invalid_email", "Enter a valid email address.");
    }

    const sql = database();
    const users = await sql<
      { id: string; password_hash: string; email_verified_at: string | null }[]
    >`
      select id, password_hash, email_verified_at from users where email = ${email} limit 1
    `;
    const user = users[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new ApiError(401, "authentication_failed", "Invalid email or password.");
    }
    if (!user.email_verified_at) {
      throw new ApiError(403, "email_not_verified", "Verify your email address before signing in.");
    }
    await setSession(user.id);
    return Response.json({ ok: true, redirectTo: "/dashboard" });
  } catch (error) {
    return errorResponse(error);
  }
}
