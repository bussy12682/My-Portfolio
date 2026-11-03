import { cookies } from "next/headers";
import { ApiError } from "./errors";
import { authRequest } from "./supabase";

const ACCESS_COOKIE = "permitt_access";
const REFRESH_COOKIE = "permitt_refresh";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type AuthUser = {
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  user_metadata?: { full_name?: string };
};

type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function setSession(session: AuthSession) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, session.access_token, cookieOptions(session.expires_in));
  store.set(REFRESH_COOKIE, session.refresh_token, cookieOptions(SESSION_MAX_AGE));
}

export async function clearSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function requireUser(): Promise<AuthUser> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!accessToken) throw new ApiError(401, "authentication_required", "Please sign in to continue.");

  try {
    return await authRequest<AuthUser>("user", { method: "GET" }, accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || !refreshToken) throw error;

    let session: AuthSession;
    try {
      session = await authRequest<AuthSession>("token?grant_type=refresh_token", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      await clearSession();
      throw new ApiError(401, "session_expired", "Your session has expired. Please sign in again.");
    }

    await setSession(session);
    return session.user;
  }
}

export function requireVerifiedEmail(user: AuthUser) {
  if (!user.email_confirmed_at) {
    throw new ApiError(403, "email_not_verified", "Verify your email address before using this feature.");
  }
}
