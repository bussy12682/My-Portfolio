import { createHash, randomBytes } from "node:crypto";
import { ApiError } from "./errors";
import { siteUrl } from "./env";
import { database } from "./database";
import { sendEmail } from "./resend";

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendAccountToken(input: {
  userId: string;
  email: string;
  purpose: "verify_email" | "reset_password";
}) {
  const token = randomBytes(32).toString("base64url");
  const digest = tokenHash(token);
  const sql = database();
  const recent = await sql<{ count: number }[]>`
    select count(*)::int as count from account_tokens
    where user_id = ${input.userId} and purpose = ${input.purpose}
      and created_at > now() - interval '1 hour'
  `;
  if ((recent[0]?.count ?? 0) >= 3) {
    throw new ApiError(
      429,
      "too_many_requests",
      "A new email was sent recently. Please try again later.",
    );
  }
  await sql`
    update account_tokens set consumed_at = now()
    where user_id = ${input.userId} and purpose = ${input.purpose} and consumed_at is null
  `;
  await sql`
    insert into account_tokens (user_id, token_hash, purpose, expires_at)
    values (
      ${input.userId}, ${digest}, ${input.purpose},
      now() + case when ${input.purpose} = 'verify_email'
        then interval '24 hours' else interval '1 hour' end
    )
  `;
  const path = input.purpose === "verify_email" ? "/auth/callback" : "/reset-password";
  const link = `${siteUrl()}${path}?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: input.email,
    subject:
      input.purpose === "verify_email"
        ? "Verify your REKTINA account"
        : "Reset your REKTINA password",
    text: `Use this link to ${input.purpose === "verify_email" ? "verify your email address" : "reset your password"}: ${link}\n\nIf you did not request this, you can ignore this email.`,
    idempotencyKey: `account-${input.purpose}-${digest.slice(0, 32)}`,
  });
}

export function hashAccountToken(token: string) {
  return tokenHash(token);
}
