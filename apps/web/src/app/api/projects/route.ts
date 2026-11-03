import { randomUUID } from "node:crypto";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { databaseRequest, databaseUrl } from "@/lib/server/supabase";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { requireUser, requireVerifiedEmail } from "@/lib/server/session";

type Project = { id: string; name: string; created_at: string };

export async function GET() {
  try {
    const user = await requireUser();
    const projects = await databaseRequest<Project[]>(
      databaseUrl("projects", {
        select: "id,name,created_at",
        owner_id: `eq.${user.id}`,
        order: "created_at.asc",
      }),
    );
    return Response.json({ projects });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await requireUser();
    requireVerifiedEmail(user);
    const body = await readJson(request);
    const name = stringField(body, "name", { min: 2, max: 80 })!;
    const projects = await databaseRequest<Project[]>(
      "projects?select=id,name,created_at",
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ id: randomUUID(), owner_id: user.id, name }),
      },
    );
    const project = projects[0];
    if (!project) throw new ApiError(503, "database_unavailable", "The project could not be created.");
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
