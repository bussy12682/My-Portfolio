"use client";

import { Button } from "@rektinasub/ui/components/ui/button";
import { Input } from "@rektinasub/ui/components/ui/input";
import { Label } from "@rektinasub/ui/components/ui/label";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { VtuPurchases } from "./vtu-purchases";
import { supportLink } from "@/config/links";

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
type DashboardData = {
  user: { email: string; emailVerified: boolean };
  wallet: { balance_kobo: string | number; currency: string };
  projects: Project[];
  keys: ApiKey[];
  messages: EmailMessage[];
  topups: Topup[];
};

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

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectName, setProjectName] = useState("");
  const [keyName, setKeyName] = useState("");
  const [topupAmount, setTopupAmount] = useState("");
  const [createdSecret, setCreatedSecret] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const paymentHandled = useRef(false);

  const loadDashboard = useCallback(async () => {
    try {
      const result = await requestJson<DashboardData>("/api/dashboard");
      setData(result);
      setSelectedProject((current) => current || result.projects[0]?.id || "");
      setError("");
    } catch (caught) {
      if (caught instanceof Error && "status" in caught && caught.status === 401) {
        router.replace("/sign-in");
        return;
      }
      setError(caught instanceof Error ? caught.message : "The dashboard could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference || paymentHandled.current) return;
    paymentHandled.current = true;
    setBusy("payment");
    void requestJson<{ status: string }>("/api/billing/verify", {
      method: "POST",
      body: JSON.stringify({ reference }),
    })
      .then((result) => {
        setNotice(
          result.status === "credited"
            ? "Payment verified and wallet credited."
            : "Payment status updated.",
        );
        window.history.replaceState(null, "", "/dashboard");
        return loadDashboard();
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "The payment could not be verified.");
      })
      .finally(() => setBusy(""));
  }, [loadDashboard]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("project");
    setError("");
    setNotice("");
    try {
      const result = await requestJson<{ project: Project }>("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: projectName }),
      });
      setProjectName("");
      setSelectedProject(result.project.id);
      setNotice("Project created.");
      await loadDashboard();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The project could not be created.");
    } finally {
      setBusy("");
    }
  }

  async function createApiKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProject) {
      setError("Create or select a project before creating an API key.");
      return;
    }
    setBusy("key");
    setError("");
    setNotice("");
    setCreatedSecret("");
    try {
      const result = await requestJson<{ secret: string }>("/api/keys", {
        method: "POST",
        body: JSON.stringify({ projectId: selectedProject, name: keyName }),
      });
      setKeyName("");
      setCreatedSecret(result.secret);
      setNotice("API key created. Copy the secret now; it will not be shown again.");
      await loadDashboard();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The API key could not be created.");
    } finally {
      setBusy("");
    }
  }

  async function revokeApiKey(key: ApiKey) {
    if (
      !window.confirm(
        `Revoke the API key “${key.name}”? Existing integrations using it will stop working.`,
      )
    ) {
      return;
    }
    setBusy(key.id);
    setError("");
    setNotice("");
    try {
      await requestJson<{ ok: boolean }>(`/api/keys/${encodeURIComponent(key.id)}`, {
        method: "DELETE",
      });
      setNotice("API key revoked.");
      await loadDashboard();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The API key could not be revoked.");
    } finally {
      setBusy("");
    }
  }

  async function startTopup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("topup");
    setError("");
    setNotice("");
    try {
      const result = await requestJson<{ authorizationUrl: string }>("/api/billing/topups", {
        method: "POST",
        body: JSON.stringify({ amountNgn: Number(topupAmount) }),
      });
      window.location.assign(result.authorizationUrl);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The wallet top-up could not be started.",
      );
      setBusy("");
    }
  }

  async function signOut() {
    setBusy("signout");
    try {
      await requestJson<{ ok: boolean }>("/api/auth/sign-out", { method: "POST" });
      router.replace("/sign-in");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "You could not be signed out.");
      setBusy("");
    }
  }

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(createdSecret);
      setNotice("API key copied to clipboard.");
    } catch {
      setError("Clipboard access was blocked. Select and copy the key manually.");
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-16 text-muted-foreground">
        Loading your workspace…
      </main>
    );
  }

  const projectKeys = data?.keys.filter((key) => key.project_id === selectedProject) ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 lg:py-16">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-orbital">Permitt by REKTINA</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Developer dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{data?.user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={supportLink.href}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Customer support
          </a>
          <Button type="button" variant="outline" onClick={signOut} disabled={busy === "signout"}>
            {busy === "signout" ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </header>

      {!data?.user.emailVerified && (
        <div className="mt-8 border border-orbital/30 bg-orbital/10 p-4 text-sm">
          Verify your email before creating projects, API keys, or wallet top-ups. Check your inbox
          for the confirmation link.
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mt-6 border border-destructive/40 bg-destructive/10 p-4 text-sm"
        >
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="mt-6 border border-orbital/30 bg-orbital/10 p-4 text-sm">
          {notice}
        </div>
      )}

      {createdSecret && (
        <section className="mt-6 rounded-lg border border-orbital/40 bg-card p-5">
          <h2 className="font-semibold">Copy your new API key</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This secret is shown only once. Store it somewhere safe.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              aria-label="New API key"
              readOnly
              value={createdSecret}
              className="h-11 font-mono"
            />
            <Button type="button" onClick={copySecret}>
              Copy key
            </Button>
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Wallet balance</p>
          <p className="mt-2 text-3xl font-semibold">
            {data ? formatNaira(data.wallet.balance_kobo) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Email sends use your prepaid balance.
          </p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Projects</p>
          <p className="mt-2 text-3xl font-semibold">{data?.projects.length ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create separate API keys for each integration.
          </p>
        </article>
      </section>

      <VtuPurchases
        emailVerified={Boolean(data?.user.emailVerified)}
        onPurchaseComplete={loadDashboard}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize your applications and their API credentials.
          </p>
          <label className="mt-5 flex flex-col gap-2 text-sm font-medium">
            Current project
            <select
              value={selectedProject}
              onChange={(event) => {
                setSelectedProject(event.target.value);
                setCreatedSecret("");
              }}
              className="h-11 rounded-md border border-input bg-background px-3 text-base"
              disabled={!data?.projects.length}
            >
              {data?.projects.length ? (
                data.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              ) : (
                <option value="">No projects yet</option>
              )}
            </select>
          </label>
          <form onSubmit={createProject} className="mt-6 flex flex-col gap-3 border-t pt-5">
            <Label htmlFor="project-name">Create a project</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="project-name"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                minLength={2}
                maxLength={80}
                required
                placeholder="e.g. Production app"
                className="h-11"
              />
              <Button type="submit" disabled={busy === "project" || !data?.user.emailVerified}>
                {busy === "project" ? "Creating…" : "Create project"}
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-lg border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">API keys</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use a key in the Authorization: Bearer header. Secrets are only shown once.
          </p>
          <form onSubmit={createApiKey} className="mt-5 flex flex-col gap-3">
            <Label htmlFor="key-name">Create a key for the selected project</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="key-name"
                value={keyName}
                onChange={(event) => setKeyName(event.target.value)}
                minLength={2}
                maxLength={80}
                required
                placeholder="e.g. Production server"
                className="h-11"
              />
              <Button
                type="submit"
                disabled={busy === "key" || !selectedProject || !data?.user.emailVerified}
              >
                {busy === "key" ? "Creating…" : "Create key"}
              </Button>
            </div>
          </form>
          <ul className="mt-6 divide-y border-t">
            {projectKeys.map((key) => (
              <li key={key.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{key.name}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {key.key_prefix}… · limit {key.daily_limit}/day
                  </p>
                </div>
                {key.revoked_at ? (
                  <span className="text-xs text-muted-foreground">Revoked</span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={Boolean(busy)}
                    onClick={() => void revokeApiKey(key)}
                  >
                    {busy === key.id ? "Revoking…" : "Revoke"}
                  </Button>
                )}
              </li>
            ))}
            {!projectKeys.length && (
              <li className="py-4 text-sm text-muted-foreground">
                No API keys for this project yet.
              </li>
            )}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-lg border bg-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Send your first email</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your API key on your server. Use a fresh idempotency key for each send and reuse it
          only when retrying that same request.
        </p>
        <pre className="mt-5 overflow-x-auto rounded-md bg-muted p-4 text-xs leading-6">
          <code>{`curl -X POST "$PERMITT_API_URL/api/v1/emails" \\
  -H "Authorization: Bearer $PERMITT_API_KEY" \\
  -H "Idempotency-Key: $(node -e 'console.log(require("node:crypto").randomUUID())')" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "customer@example.com",
    "subject": "Welcome",
    "text": "Your account is ready."
  }'`}</code>
        </pre>
        <p className="mt-3 text-xs text-muted-foreground">
          Requests are billed from your wallet. Configure Resend and your sender address before
          sending.
        </p>
      </section>

      <section className="mt-8 rounded-lg border bg-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Add wallet credits</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a whole-naira amount. Payment opens securely with Paystack.
        </p>
        <form
          onSubmit={startTopup}
          className="mt-5 flex flex-col gap-3 sm:max-w-xl sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="topup-amount">Amount (NGN)</Label>
            <Input
              id="topup-amount"
              type="number"
              min="1"
              step="1"
              required
              value={topupAmount}
              onChange={(event) => setTopupAmount(event.target.value)}
              placeholder="500"
              className="h-11"
            />
          </div>
          <Button type="submit" disabled={busy === "topup" || !data?.user.emailVerified}>
            {busy === "topup" ? "Starting payment…" : "Continue to payment"}
          </Button>
        </form>
      </section>

      <section className="mt-8 rounded-lg border bg-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Recent email activity</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <th className="pr-4 pb-3 font-medium">Recipient / subject</th>
                <th className="pr-4 pb-3 font-medium">Status</th>
                <th className="pr-4 pb-3 font-medium">Cost</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.messages.map((message) => (
                <tr key={message.id}>
                  <td className="py-3 pr-4">
                    <p>{message.recipient}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{message.subject}</p>
                  </td>
                  <td className="py-3 pr-4 capitalize">{message.status}</td>
                  <td className="py-3 pr-4">{formatNaira(message.amount_kobo)}</td>
                  <td className="py-3">{formatDate(message.created_at)}</td>
                </tr>
              ))}
              {!data?.messages.length && (
                <tr>
                  <td className="py-4 text-muted-foreground" colSpan={4}>
                    No email sends yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-lg border bg-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Recent top-ups</h2>
        <ul className="mt-4 divide-y">
          {data?.topups.map((topup) => (
            <li key={topup.reference} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
              <span>
                {formatNaira(topup.amount_kobo)} ·{" "}
                <span className="text-muted-foreground capitalize">{topup.status}</span>
              </span>
              <span className="text-muted-foreground">{formatDate(topup.created_at)}</span>
            </li>
          ))}
          {!data?.topups.length && (
            <li className="py-3 text-sm text-muted-foreground">No top-ups yet.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
