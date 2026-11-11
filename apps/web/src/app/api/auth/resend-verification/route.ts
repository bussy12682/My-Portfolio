import { errorResponse } from "@/lib/server/errors";
import { database } from "@/lib/server/database";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { sendAccountToken } from "@/lib/server/account-tokens";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const email = stringField(body, "email", { max: 254 })!.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: { code: "invalid_email", message: "Enter a valid email address." } },
        { status: 400 },
      );
    }

    const sql = database();
    const users = await sql<{ id: string; email: string; email_verified_at: string | null }[]>`
      select id, email, email_verified_at from users where email = ${email} limit 1
    `;
    if (users[0] && !users[0].email_verified_at) {
      await sendAccountToken({
        userId: users[0].id,
        email: users[0].email,
        purpose: "verify_email",
      });
    }
    return Response.json({
      ok: true,
      message: "If the account needs verification, a new link has been sent.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
