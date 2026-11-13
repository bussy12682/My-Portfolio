import { ApiError } from "./errors";

const API_BASE = "https://telecomabode.com.ng/api";
const PROVIDER_TIMEOUT_MS = 20_000;

export type AirtimeNetwork = {
  id: number;
  name: string;
  code: string;
};

export type DataPlan = {
  id: string;
  dataPlanId: number;
  networkId: number;
  network: string;
  description: string;
  priceKobo: number;
};

export type ProviderResult = {
  status: "successful" | "failed" | "unknown";
  message: string;
  failureReason?: string;
};

function apiKey() {
  const key = process.env.TELECOM_ABODE_API_KEY?.trim();
  if (!key) {
    throw new ApiError(
      503,
      "service_not_configured",
      "The Telecom Abode provider is not configured on the server.",
    );
  }
  return key;
}

async function providerRequest(path: string, init?: RequestInit) {
  const key = apiKey();
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      headers: {
        authorization: `Bearer ${key}`,
        ...(init?.body ? { "content-type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      503,
      "provider_unavailable",
      "Telecom Abode could not be reached. Please try again.",
    );
  }
}

async function responseJson(response: Response, endpoint: string): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    console.error("Telecom Abode returned a non-JSON response", {
      endpoint,
      status: response.status,
      contentType: response.headers.get("content-type"),
    });
    throw new ApiError(
      502,
      "provider_invalid_response",
      "Telecom Abode returned an invalid response.",
    );
  }
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function rowsFrom(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((row): row is Record<string, unknown> => objectValue(row) !== null);
  }
  const object = objectValue(value);
  if (!object) return [];
  return rowsFrom(object.data ?? object.results ?? object.plans);
}

function positiveInteger(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function priceInKobo(value: unknown) {
  const price = typeof value === "number" ? value : Number(value);
  if (
    !Number.isFinite(price) ||
    price <= 0 ||
    Math.abs(price * 100 - Math.round(price * 100)) > 0.001
  ) {
    return null;
  }
  const kobo = Math.round(price * 100);
  return Number.isSafeInteger(kobo) ? kobo : null;
}

function requireCatalogSuccess(response: Response, body: unknown) {
  if (!response.ok) {
    throw new ApiError(
      response.status >= 500 ? 503 : 502,
      "provider_catalog_unavailable",
      "Telecom Abode could not load its product catalog.",
    );
  }
  const object = objectValue(body);
  const status = String(object?.status ?? "").toLowerCase();
  if (status === "fail" || status === "failed" || status === "error") {
    throw new ApiError(
      502,
      "provider_catalog_unavailable",
      "Telecom Abode could not load its product catalog.",
    );
  }
}

async function getNetworks(service: "airtime" | "data"): Promise<AirtimeNetwork[]> {
  const endpoint = `/get-networks?service=${service}`;
  const response = await providerRequest(endpoint);
  const body = await responseJson(response, endpoint);
  requireCatalogSuccess(response, body);
  const networks = rowsFrom(body)
    .map((row) => {
      const id = positiveInteger(row.id);
      const nameValue = row.network ?? row.name;
      const codeValue = row.prefix ?? row.code;
      const name = typeof nameValue === "string" ? nameValue.trim() : "";
      const code = typeof codeValue === "string" ? codeValue.trim() : "";
      return id && name && code ? { id, name, code } : null;
    })
    .filter((network): network is AirtimeNetwork => network !== null);
  if (!networks.length) {
    throw new ApiError(
      502,
      "provider_catalog_invalid",
      "Telecom Abode returned no usable airtime networks.",
    );
  }
  return networks;
}

export async function getAirtimeNetworks(): Promise<AirtimeNetwork[]> {
  return getNetworks("airtime");
}

export async function getDataPlans(): Promise<DataPlan[]> {
  const endpoint = "/data_plans";
  const [response, networks] = await Promise.all([providerRequest(endpoint), getNetworks("data")]);
  const body = await responseJson(response, endpoint);
  requireCatalogSuccess(response, body);
  const networkIds = new Map(
    networks.map((network) => [network.name.toLowerCase(), network.id] as const),
  );
  const plans = rowsFrom(body)
    .map((row) => {
      const dataPlanId = positiveInteger(row.plan_id);
      const network = typeof row.network === "string" ? row.network.trim() : "";
      const networkId = networkIds.get(network.toLowerCase());
      const size = typeof row.datasize === "string" ? row.datasize.trim() : "";
      const type = typeof row.type === "string" ? row.type.trim() : "";
      const day = row.day === undefined ? "" : String(row.day).trim();
      const priceKobo = priceInKobo(row.price);
      if (!dataPlanId || !network || !networkId || !size || priceKobo === null) return null;
      const description = [network, size, type, day ? `${day} days` : ""]
        .filter(Boolean)
        .join(" · ");
      return { id: String(dataPlanId), dataPlanId, networkId, network, description, priceKobo };
    })
    .filter((plan): plan is DataPlan => plan !== null);
  if (!plans.length) {
    throw new ApiError(
      502,
      "provider_catalog_invalid",
      "Telecom Abode returned no usable data plans.",
    );
  }
  return plans;
}

function providerMessage(body: unknown) {
  const object = objectValue(body);
  for (const field of ["message", "response", "detail"]) {
    const value = object?.[field];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 500);
  }
  return "";
}

function classifyProviderResult(response: Response, body: unknown): ProviderResult {
  const object = objectValue(body);
  const status = String(object?.status ?? "").toLowerCase();
  const providerStatus = String(object?.Status ?? "").toLowerCase();
  const message = providerMessage(body);

  if (response.status >= 500 || response.status === 408) {
    return { status: "unknown", message };
  }
  if (
    providerStatus === "successful" ||
    providerStatus === "success" ||
    (!providerStatus && (status === "successful" || status === "success"))
  ) {
    return { status: "successful", message };
  }
  if (
    ["failed", "fail", "error", "unsuccessful"].includes(providerStatus) ||
    ["failed", "fail", "error", "unsuccessful"].includes(status)
  ) {
    return { status: "failed", message, failureReason: "provider_rejected" };
  }
  if (response.status >= 400 && response.status < 500 && response.status !== 408) {
    return { status: "failed", message, failureReason: `provider_http_${response.status}` };
  }
  return { status: "unknown", message };
}

async function submitPurchase(
  path: string,
  payload: Record<string, string | number | boolean>,
): Promise<ProviderResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      headers: {
        authorization: `Token ${apiKey()}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return { status: "unknown", message: "" };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    return { status: "unknown", message: "" };
  }
  return classifyProviderResult(response, body);
}

export function buyAirtime(input: {
  network: number;
  phone: string;
  amountNgn: number;
  requestId: string;
}) {
  return submitPurchase("/airtime", {
    network: input.network,
    phone: input.phone,
    amount: String(input.amountNgn),
    plan_type: "VTU",
    "request-id": input.requestId,
  });
}

export function buyData(input: {
  network: number;
  phone: string;
  dataPlan: number;
  requestId: string;
}) {
  return submitPurchase("/data", {
    network: input.network,
    phone: input.phone,
    data_plan: input.dataPlan,
    bypass: false,
    "request-id": input.requestId,
  });
}

export async function getTransactionStatus(requestId: string): Promise<ProviderResult> {
  const response = await providerRequest(`/transaction/${encodeURIComponent(requestId)}`);
  if (response.status === 404) return { status: "unknown", message: "" };
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    console.error("Telecom Abode returned a non-JSON transaction response", {
      status: response.status,
      contentType: response.headers.get("content-type"),
    });
    return { status: "unknown", message: "" };
  }
  if (!response.ok) return { status: "unknown", message: providerMessage(body) };
  return classifyProviderResult(response, body);
}
