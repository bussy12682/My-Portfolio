import { createHash, randomBytes, randomUUID } from "node:crypto";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { emailDailyLimit } from "@/lib/server/env";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { database } from "@/lib/server/database";
import { requireUser, requireVerifiedEmail } from "@/lib/server/session";

type Project = { id: string };
type ApiKeyRow = {
  id: string;
  project_id: string;
  name: string;
  key_prefix: string;
  daily_limit: number;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const projectId = new URL(request.url).searchParams.get("projectId") ?? "";
    if (!isUuid(projectId)) throw new ApiError(400, "invalid_project", "Choose a valid project.");

    const sql = database();
    const rows = await sql<ApiKeyRow[]>`
      select id, project_id, name, key_prefix, daily_limit, last_used_at, revoked_at, created_at
      from api_keys where owner_id = ${user.id} and project_id = ${projectId}
      order by created_at desc
    `;
    return Response.json({ keys: rows });
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
    const projectId = stringField(body, "projectId", { max: 36 })!;
    const name = stringField(body, "name", { min: 2, max: 80 })!;
    if (!isUuid(projectId)) throw new ApiError(400, "invalid_project", "Choose a valid project.");

    const sql = database();
    const projects = await sql<Project[]>`
      select id from projects where id = ${projectId} and owner_id = ${user.id} limit 1
    `;
    if (!projects[0]) throw new ApiError(404, "project_not_found", "The project was not found.");

    const rawKey = `rk_live_${randomBytes(32).toString("base64url")}`;
    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    const rows = await sql<ApiKeyRow[]>`
      insert into api_keys (id, project_id, owner_id, name, key_prefix, key_hash, daily_limit)
      values (${randomUUID()}, ${projectId}, ${user.id}, ${name}, ${rawKey.slice(0, 15)}, ${keyHash}, ${emailDailyLimit()})
      returning id, project_id, name, key_prefix, daily_limit, last_used_at, revoked_at, created_at
    `;
    const apiKey = rows[0];
    if (!apiKey)
      throw new ApiError(503, "database_unavailable", "The API key could not be created.");
    return Response.json({ key: apiKey, secret: rawKey }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
