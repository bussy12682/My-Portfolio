import { errorResponse } from "@/lib/server/errors";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { database } from "@/lib/server/database";
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
    const users = await sql<{ id: string; email: string }[]>`
      select id, email from users where email = ${email} limit 1
    `;
    if (users[0]) {
      await sendAccountToken({
        userId: users[0].id,
        email: users[0].email,
        purpose: "reset_password",
      });
    }
    return Response.json({
      ok: true,
      message: "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
