import { ApiError, errorResponse } from "@/lib/server/errors";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { setSession } from "@/lib/server/session";
import { authRequest } from "@/lib/server/supabase";

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
  };
};

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const email = stringField(body, "email", { max: 254 })!.toLowerCase();
    const password = stringField(body, "password", { max: 128 })!;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "invalid_email", "Enter a valid email address.");
    }

    const session = await authRequest<AuthResponse>("token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!session.access_token || !session.refresh_token || !session.user || !session.user.email) {
      throw new ApiError(401, "authentication_failed", "Invalid email or password.");
    }
    await setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in ?? 3600,
      user: {
        id: session.user.id,
        email: session.user.email,
        email_confirmed_at: session.user.email_confirmed_at ?? null,
      },
    });
    return Response.json({ ok: true, redirectTo: "/dashboard" });
  } catch (error) {
    return errorResponse(error);
  }
}
