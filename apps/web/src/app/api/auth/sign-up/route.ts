import { ApiError, errorResponse } from "@/lib/server/errors";
import { siteUrl } from "@/lib/server/env";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { setSession } from "@/lib/server/session";
import { authRequest } from "@/lib/server/supabase";

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
  };
};

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const name = stringField(body, "name", { min: 2, max: 100 });
    const email = stringField(body, "email", { max: 254 })!.toLowerCase();
    const password = stringField(body, "password", { min: 12, max: 128 })!;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "invalid_email", "Enter a valid email address.");
    }

    const redirectTo = `${siteUrl()}/auth/callback`;
    const auth = await authRequest<AuthResponse>(
      `signup?redirect_to=${encodeURIComponent(redirectTo)}`,
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          data: { full_name: name },
        }),
      },
    );

    if (auth.access_token && auth.refresh_token && auth.user && auth.user.email) {
      await setSession({
        access_token: auth.access_token,
        refresh_token: auth.refresh_token,
        expires_in: auth.expires_in ?? 3600,
        user: {
          id: auth.user.id,
          email: auth.user.email,
          email_confirmed_at: auth.user.email_confirmed_at ?? null,
        },
      });
      return Response.json({ ok: true, redirectTo: "/dashboard" });
    }

    return Response.json({
      ok: true,
      confirmationRequired: true,
      message: "Check your inbox for the email verification link before signing in.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
