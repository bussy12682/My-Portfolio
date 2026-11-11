import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ApiError } from "./errors";
import { database } from "./database";

const SESSION_COOKIE = "permitt_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type AuthUser = {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  user_metadata: { full_name: string };
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function setSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const sql = database();
  await sql`
    insert into sessions (user_id, token_hash, expires_at)
    values (${userId}, ${hashToken(token)}, now() + interval '30 days')
  `;
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions(SESSION_MAX_AGE));
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const sql = database();
    await sql`delete from sessions where token_hash = ${hashToken(token)}`;
  }
  store.delete(SESSION_COOKIE);
}

export async function requireUser(): Promise<AuthUser> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) throw new ApiError(401, "authentication_required", "Please sign in to continue.");

  const sql = database();
  const rows = await sql<AuthUser[]>`
    select u.id, u.email, u.email_verified_at as email_confirmed_at,
           jsonb_build_object('full_name', u.full_name) as user_metadata
    from sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now()
    limit 1
  `;
  if (!rows[0]) {
    await clearSession();
    throw new ApiError(401, "session_expired", "Your session has expired. Please sign in again.");
  }
  return rows[0] as AuthUser;
}

export function requireVerifiedEmail(user: AuthUser) {
  if (!user.email_confirmed_at) {
    throw new ApiError(
      403,
      "email_not_verified",
      "Verify your email address before using this feature.",
    );
  }
}
