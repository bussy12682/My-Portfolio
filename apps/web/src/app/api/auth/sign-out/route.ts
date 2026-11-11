import { errorResponse } from "@/lib/server/errors";
import { requireSameOrigin } from "@/lib/server/http";
import { clearSession } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await clearSession();
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
