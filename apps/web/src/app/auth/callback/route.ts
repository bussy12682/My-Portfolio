import { siteUrl } from "@/lib/server/env";
import { authRequest } from "@/lib/server/supabase";
import { setSession } from "@/lib/server/session";

type VerifiedSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email?: string; email_confirmed_at?: string | null };
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (!tokenHash || !type || tokenHash.length > 512) {
    return Response.redirect(`${siteUrl()}/sign-in?error=verification_failed`);
  }

  try {
    const session = await authRequest<VerifiedSession>("verify", {
      method: "POST",
      body: JSON.stringify({ token_hash: tokenHash, type }),
    });
    if (!session.access_token || !session.refresh_token || !session.user || !session.user.email) {
      return Response.redirect(`${siteUrl()}/sign-in?error=verification_failed`);
    }
    await setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      user: {
        id: session.user.id,
        email: session.user.email,
        email_confirmed_at: session.user.email_confirmed_at ?? null,
      },
    });
    return Response.redirect(`${siteUrl()}/dashboard`);
  } catch {
    return Response.redirect(`${siteUrl()}/sign-in?error=verification_failed`);
  }
}
