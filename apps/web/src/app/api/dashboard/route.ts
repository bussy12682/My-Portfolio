import { connection } from "next/server";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { databaseRequest, databaseUrl } from "@/lib/server/supabase";
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
    const owner = `eq.${user.id}`;
    const [wallets, projects, keys, messages, topups] = await Promise.all([
      databaseRequest<Wallet[]>(
        databaseUrl("wallets", {
          select: "balance_kobo,currency",
          owner_id: owner,
          limit: "1",
        }),
      ),
      databaseRequest<Project[]>(
        databaseUrl("projects", {
          select: "id,name,created_at",
          owner_id: owner,
          order: "created_at.asc",
        }),
      ),
      databaseRequest<ApiKey[]>(
        databaseUrl("api_keys", {
          select: "id,project_id,name,key_prefix,daily_limit,last_used_at,revoked_at,created_at",
          owner_id: owner,
          order: "created_at.desc",
        }),
      ),
      databaseRequest<EmailMessage[]>(
        databaseUrl("email_messages", {
          select: "id,recipient,subject,status,amount_kobo,created_at",
          owner_id: owner,
          order: "created_at.desc",
          limit: "10",
        }),
      ),
      databaseRequest<Topup[]>(
        databaseUrl("topups", {
          select: "reference,amount_kobo,status,created_at",
          owner_id: owner,
          order: "created_at.desc",
          limit: "10",
        }),
      ),
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
