import { ApiError, errorResponse } from "@/lib/server/errors";
import { requireSameOrigin } from "@/lib/server/http";
import { databaseRequest, databaseUrl } from "@/lib/server/supabase";
import { requireUser, requireVerifiedEmail } from "@/lib/server/session";

type RouteContext = { params: Promise<{ keyId: string }> };
type ApiKeyRow = { id: string };

export async function DELETE(request: Request, context: RouteContext) {
  try {
    requireSameOrigin(request);
    const user = await requireUser();
    requireVerifiedEmail(user);
    const { keyId } = await context.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(keyId)) {
      throw new ApiError(400, "invalid_key", "Choose a valid API key.");
    }

    const updated = await databaseRequest<ApiKeyRow[]>(
      databaseUrl("api_keys", {
        id: `eq.${keyId}`,
        owner_id: `eq.${user.id}`,
        revoked_at: "is.null",
        select: "id",
      }),
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ revoked_at: new Date().toISOString() }),
      },
    );
    if (!updated[0]) throw new ApiError(404, "key_not_found", "An active API key with that ID was not found.");
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
