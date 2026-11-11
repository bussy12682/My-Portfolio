"use client";

import { Button } from "@rektinasub/ui/components/ui/button";
import { Input } from "@rektinasub/ui/components/ui/input";
import { Label } from "@rektinasub/ui/components/ui/label";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

type Service = "airtime" | "data";
type Network = { id: number; name: string; code: string };
type DataPlan = { id: string; network: string; description: string; priceKobo: number };
type Purchase = {
  id: string;
  service: Service;
  provider_product_id: string;
  product_label: string;
  recipient: string;
  amount_kobo: string | number;
  status: string;
  provider_message: string | null;
  failure_reason: string | null;
  created_at: string;
};
type PurchasePayload = {
  service: Service;
  phone: string;
  networkId?: number;
  amountNgn?: number;
  planId?: string;
};
type PendingSubmission = { key: string; payload: PurchasePayload };

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      result &&
      typeof result === "object" &&
      "error" in result &&
      result.error &&
      typeof result.error === "object" &&
      "message" in result.error &&
      typeof result.error.message === "string"
        ? result.error.message
        : "The request could not be completed. Please try again.";
    throw Object.assign(new Error(message), { status: response.status });
  }
  if (!result || typeof result !== "object") {
    throw new Error("The service returned an unexpected response. Please try again.");
  }
  return result as T;
}

function formatNaira(kobo: string | number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number(kobo) / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function VtuPurchases({
  emailVerified,
  onPurchaseComplete,
}: {
  emailVerified: boolean;
  onPurchaseComplete: () => void;
}) {
  const [service, setService] = useState<Service>("airtime");
  const [phone, setPhone] = useState("");
  const [networkId, setNetworkId] = useState("");
  const [amountNgn, setAmountNgn] = useState("");
  const [planId, setPlanId] = useState("");
  const [networks, setNetworks] = useState<Network[]>([]);
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingSubmission, setPendingSubmission] = useState<PendingSubmission | null>(null);
  const inFlight = useRef(false);

  const loadOrders = useCallback(async () => {
    const result = await requestJson<{ orders: Purchase[] }>("/api/vtu/orders");
    setOrders(result.orders);
  }, []);

  const loadCatalog = useCallback(async (selectedService: Service) => {
    setCatalogLoading(true);
    setError("");
    try {
      if (selectedService === "airtime") {
        const result = await requestJson<{ networks: Network[] }>(
          "/api/vtu/catalog?service=airtime",
        );
        setNetworks(result.networks);
        setNetworkId((current) =>
          result.networks.some((network) => String(network.id) === current)
            ? current
            : String(result.networks[0]?.id ?? ""),
        );
      } else {
        const result = await requestJson<{ plans: DataPlan[] }>("/api/vtu/catalog?service=data");
        setPlans(result.plans);
        setPlanId((current) =>
          result.plans.some((plan) => plan.id === current) ? current : (result.plans[0]?.id ?? ""),
        );
      }
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The product catalog could not be loaded.",
      );
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCatalog(service);
      void loadOrders().catch((caught: unknown) => {
        setError(
          caught instanceof Error ? caught.message : "Purchase history could not be loaded.",
        );
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCatalog, loadOrders, service]);

  const selectedPlan = plans.find((plan) => plan.id === planId);
  const pendingOrder = orders.some(
    (order) => order.status === "processing" || order.status === "unknown",
  );

  async function submitPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    if (pendingOrder) {
      setError("Recheck your pending purchase before starting another one.");
      return;
    }

    const payload: PurchasePayload =
      service === "airtime"
        ? {
            service,
            phone,
            networkId: Number(networkId),
            amountNgn: Number(amountNgn),
          }
        : { service, phone, planId };
    const submission = pendingSubmission ?? {
      key: window.crypto.randomUUID(),
      payload,
    };

    inFlight.current = true;
    setBusy("purchase");
    setError("");
    setNotice("");
    setPendingSubmission(submission);
    try {
      const result = await requestJson<{ order: Purchase }>("/api/vtu/orders", {
        method: "POST",
        headers: { "Idempotency-Key": submission.key },
        body: JSON.stringify(submission.payload),
      });
      setPendingSubmission(null);
      setOrders((current) => [
        result.order,
        ...current.filter((order) => order.id !== result.order.id),
      ]);
      setNotice(
        result.order.status === "successful"
          ? "Purchase completed successfully."
          : result.order.status === "failed"
            ? "The provider rejected the purchase and the reserved amount was refunded."
            : "Purchase submitted. The wallet amount remains reserved until its status is confirmed.",
      );
      await Promise.all([loadOrders(), onPurchaseComplete()]);
    } catch (caught) {
      if (
        caught &&
        typeof caught === "object" &&
        "status" in caught &&
        (caught.status === 400 || caught.status === 402 || caught.status === 409)
      ) {
        setPendingSubmission(null);
      }
      setError(caught instanceof Error ? caught.message : "The purchase could not be submitted.");
    } finally {
      inFlight.current = false;
      setBusy("");
    }
  }

  async function reconcile(order: Purchase) {
    setBusy(order.id);
    setError("");
    setNotice("");
    try {
      const result = await requestJson<{ order: Pick<Purchase, "id" | "status"> }>(
        `/api/vtu/orders/${encodeURIComponent(order.id)}/reconcile`,
        { method: "POST" },
      );
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, status: result.order.status } : item,
        ),
      );
      setNotice(
        result.order.status === "successful"
          ? "Purchase confirmed successfully."
          : result.order.status === "failed"
            ? "The purchase failed and the reserved amount was refunded."
            : "The provider has not confirmed this purchase yet. The amount remains reserved.",
      );
      await Promise.all([loadOrders(), onPurchaseComplete()]);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The purchase status could not be checked.",
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="mt-8 rounded-lg border bg-card p-5 sm:p-6">
      <h2 className="text-xl font-semibold">Buy airtime or data</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Purchases are charged to your wallet at the provider-listed price.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-5 border border-destructive/40 bg-destructive/10 p-3 text-sm"
        >
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="mt-5 border border-orbital/30 bg-orbital/10 p-3 text-sm">
          {notice}
        </div>
      )}
      {pendingSubmission && (
        <p className="mt-4 text-sm text-muted-foreground">
          We did not receive a definite response. Retry the same request safely; do not edit the
          purchase details.
        </p>
      )}

      <form onSubmit={submitPurchase} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="vtu-service">Service</Label>
          <select
            id="vtu-service"
            value={service}
            onChange={(event) => {
              setService(event.target.value as Service);
              setNotice("");
            }}
            disabled={Boolean(busy) || Boolean(pendingSubmission)}
            className="h-11 rounded-md border border-input bg-background px-3 text-base disabled:opacity-60"
          >
            <option value="airtime">Airtime</option>
            <option value="data">Data</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vtu-phone">Nigerian phone number</Label>
          <Input
            id="vtu-phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={20}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="08012345678"
            className="h-11"
            disabled={Boolean(busy) || Boolean(pendingSubmission)}
          />
        </div>

        {service === "airtime" ? (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="vtu-network">Network</Label>
              <select
                id="vtu-network"
                required
                value={networkId}
                onChange={(event) => setNetworkId(event.target.value)}
                disabled={catalogLoading || Boolean(busy) || Boolean(pendingSubmission)}
                className="h-11 rounded-md border border-input bg-background px-3 text-base disabled:opacity-60"
              >
                {networks.map((network) => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="vtu-amount">Airtime amount (NGN)</Label>
              <Input
                id="vtu-amount"
                type="number"
                min="1"
                step="1"
                required
                value={amountNgn}
                onChange={(event) => setAmountNgn(event.target.value)}
                placeholder="500"
                className="h-11"
                disabled={Boolean(busy) || Boolean(pendingSubmission)}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="vtu-plan">Data plan</Label>
            <select
              id="vtu-plan"
              required
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
              disabled={catalogLoading || Boolean(busy) || Boolean(pendingSubmission)}
              className="h-11 rounded-md border border-input bg-background px-3 text-base disabled:opacity-60"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.description} — {formatNaira(plan.priceKobo)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
          <p className="text-sm text-muted-foreground">
            {catalogLoading
              ? "Loading provider catalog…"
              : service === "airtime"
                ? amountNgn && Number.isSafeInteger(Number(amountNgn))
                  ? `Total: ${formatNaira(Number(amountNgn) * 100)}`
                  : "Enter an amount to see the total."
                : selectedPlan
                  ? `Total: ${formatNaira(selectedPlan.priceKobo)}`
                  : "No data plans are available."}
          </p>
          <Button
            type="submit"
            disabled={
              !emailVerified ||
              catalogLoading ||
              Boolean(busy) ||
              pendingOrder ||
              (!networks.length && service === "airtime") ||
              (!plans.length && service === "data")
            }
          >
            {busy === "purchase"
              ? "Submitting…"
              : pendingSubmission
                ? "Retry same purchase"
                : pendingOrder
                  ? "Recheck pending purchase first"
                  : "Confirm purchase"}
          </Button>
        </div>
        {!emailVerified && (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Verify your email before buying airtime or data.
          </p>
        )}
      </form>

      <div className="mt-7 border-t pt-5">
        <h3 className="font-semibold">Recent purchases</h3>
        <ul className="mt-3 divide-y">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {order.product_label} · {order.recipient}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNaira(order.amount_kobo)} · {formatDate(order.created_at)}
                  {order.provider_message ? ` · ${order.provider_message}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground capitalize">{order.status}</span>
                {(order.status === "processing" || order.status === "unknown") && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={Boolean(busy)}
                    onClick={() => void reconcile(order)}
                  >
                    {busy === order.id ? "Checking…" : "Recheck"}
                  </Button>
                )}
              </div>
            </li>
          ))}
          {!orders.length && (
            <li className="py-3 text-sm text-muted-foreground">No purchases yet.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
