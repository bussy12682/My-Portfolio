import { connection } from "next/server";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { requireUser, requireVerifiedEmail } from "@/lib/server/session";
import { getAirtimeNetworks, getDataPlans } from "@/lib/server/telecom-abode";

export async function GET(request: Request) {
  await connection();
  try {
    const user = await requireUser();
    requireVerifiedEmail(user);
    const service = new URL(request.url).searchParams.get("service");
    if (service === "airtime") {
      return Response.json(
        { networks: await getAirtimeNetworks() },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (service === "data") {
      return Response.json(
        { plans: await getDataPlans() },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    throw new ApiError(400, "invalid_service", "Choose either airtime or data.");
  } catch (error) {
    return errorResponse(error);
  }
}
