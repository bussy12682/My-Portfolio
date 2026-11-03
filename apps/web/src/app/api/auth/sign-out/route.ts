import { errorResponse } from "@/lib/server/errors";
import { requireSameOrigin } from "@/lib/server/http";
import { clearSession } from "@/lib/server/session";
import { authRequest } from "@/lib/server/supabase";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const store = await cookies();
    const token = store.get("permitt_access")?.value;
    if (token) await authRequest("logout", { method: "POST" }, token);
    await clearSession();
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
