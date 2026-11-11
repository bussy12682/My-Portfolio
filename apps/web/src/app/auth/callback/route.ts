import { siteUrl } from "@/lib/server/env";
import { database } from "@/lib/server/database";
import { hashAccountToken } from "@/lib/server/account-tokens";
import { setSession } from "@/lib/server/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token || token.length > 128) {
    return Response.redirect(`${siteUrl()}/sign-in?error=verification_failed`);
  }

  try {
    const sql = database();
    const rows = await sql<{ user_id: string | null }[]>`
      select verify_account_token(${hashAccountToken(token)}) as user_id
    `;
    const userId = rows[0]?.user_id;
    if (!userId) {
      return Response.redirect(`${siteUrl()}/sign-in?error=verification_failed`);
    }
    await setSession(userId);
    return Response.redirect(`${siteUrl()}/dashboard`);
  } catch {
    return Response.redirect(`${siteUrl()}/sign-in?error=verification_failed`);
  }
}
