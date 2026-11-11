import { connection } from "next/server";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { database } from "@/lib/server/database";
import { requireUser } from "@/lib/server/session";

type Wallet = { balance_kobo: string | number; currency: string };
type Project = { id: string; name: string; created_at: string };
type ApiKey = {
  id: string;
  project_id: string;
  name: string;
  key_prefix: string;
  daily_limit: number;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};
type EmailMessage = {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  amount_kobo: string | number;
  created_at: string;
};
type Topup = {
  reference: string;
  amount_kobo: string | number;
  status: string;
  created_at: string;
};

export async function GET() {
  await connection();
  try {
    const user = await requireUser();
    const sql = database();
    const [wallets, projects, keys, messages, topups] = await Promise.all([
      sql<Wallet[]>`select balance_kobo, currency from wallets where owner_id = ${user.id} limit 1`,
      sql<
        Project[]
      >`select id, name, created_at from projects where owner_id = ${user.id} order by created_at asc`,
      sql<
        ApiKey[]
      >`select id, project_id, name, key_prefix, daily_limit, last_used_at, revoked_at, created_at
        from api_keys where owner_id = ${user.id} order by created_at desc`,
      sql<EmailMessage[]>`select id, recipient, subject, status, amount_kobo, created_at
        from email_messages where owner_id = ${user.id} order by created_at desc limit 10`,
      sql<Topup[]>`select reference, amount_kobo, status, created_at
        from topups where owner_id = ${user.id} order by created_at desc limit 10`,
    ]);

    const wallet = wallets[0];
    if (!wallet) {
      throw new ApiError(503, "wallet_unavailable", "Your wallet could not be loaded.");
    }

    return Response.json({
      user: {
        email: user.email,
        emailVerified: Boolean(user.email_confirmed_at),
      },
      wallet,
      projects,
      keys,
      messages,
      topups,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
