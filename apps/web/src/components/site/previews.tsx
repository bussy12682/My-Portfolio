import { Parallax } from "@rektinasub/ui/components/motion";
import {
  CodeBlock,
  StatusPill,
  Timeline,
  Window,
  type TimelineItem,
} from "@rektinasub/ui/components/showcase";
import { cn } from "@rektinasub/ui/lib/utils";
import type { ReactNode } from "react";

/**
 * Product screens for marketing pages, drawn with the showcase foundations and shown on light
 * stages. They illustrate real flows from the PRD; the values in `config/home.ts` are illustrative.
 */

/**
 * Places a screen on a stage: centred, starting a little below the top edge and cropped by the
 * stage at the bottom. `scale` shrinks it for small stages such as the hero card.
 */
export function StageScreen({
  children,
  width = "26rem",
  scale = 1,
  className,
}: {
  children: ReactNode;
  width?: string;
  scale?: number;
  className?: string;
}) {
  return (
    <div className={cn("absolute inset-x-0 top-[9%] flex justify-center px-6", className)}>
      <Parallax speed={-0.03}>
        <div
          className="origin-top"
          style={{ width, transform: scale === 1 ? undefined : `scale(${scale})` }}
        >
          {children}
        </div>
      </Parallax>
    </div>
  );
}

function PayButton({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-10 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="flex h-10 items-center rounded-md border px-3 text-sm">{value}</span>
    </div>
  );
}

export type ReceiptData = {
  id: string;
  status: string;
  rows: { label: string; value: string }[];
  total: { label: string; value: string };
  timeline: TimelineItem[];
};

/** An order receipt: details, the amount charged and the order's timeline. */
export function ReceiptScreen({ order }: { order: ReceiptData }) {
  return (
    <Window title={order.id} meta={<StatusPill>{order.status}</StatusPill>}>
      <dl className="grid gap-2.5 px-5 pt-5 text-[0.8125rem]">
        {order.rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mx-5 mt-4 flex items-baseline justify-between border-t pt-4">
        <span className="text-[0.8125rem] text-muted-foreground">{order.total.label}</span>
        <span className="text-2xl font-semibold tracking-[-0.03em] tabular-nums">
          {order.total.value}
        </span>
      </div>
      <Timeline items={order.timeline} className="mt-4 border-t bg-muted/60 px-5 py-4" />
    </Window>
  );
}

export type PlanData = {
  recipient: string;
  plans: { name: string; detail: string; price: string; selected?: boolean }[];
  pay: string;
};

/** Buying data: the recipient, a list of bundles with one selected, and the pay button. */
export function PlanScreen({ data }: { data: PlanData }) {
  return (
    <Window title="Buy data">
      <div className="flex flex-col gap-4 p-5">
        <Field label="Phone number" value={data.recipient} />
        <ul className="flex flex-col gap-2">
          {data.plans.map((plan) => (
            <li
              key={plan.name}
              className={cn(
                "flex items-center justify-between gap-4 rounded-md border px-3.5 py-2.5 text-[0.8125rem]",
                plan.selected ? "border-primary bg-primary/5" : "bg-background",
              )}
            >
              <span className="flex flex-col">
                <span className="font-medium">{plan.name}</span>
                <span className="text-xs text-muted-foreground">{plan.detail}</span>
              </span>
              <span className="font-medium tabular-nums">{plan.price}</span>
            </li>
          ))}
        </ul>
        <PayButton>{data.pay}</PayButton>
      </div>
    </Window>
  );
}

export type AirtimeData = {
  recipient: string;
  amounts: { value: string; selected?: boolean }[];
  pay: string;
  note: string;
};

/** Buying airtime: recipient, preset amounts and the pay button with the final price. */
export function AirtimeScreen({ data }: { data: AirtimeData }) {
  return (
    <Window title="Buy airtime">
      <div className="flex flex-col gap-4 p-5">
        <Field label="Phone number" value={data.recipient} />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Amount</span>
          <div className="grid grid-cols-4 gap-2">
            {data.amounts.map((amount) => (
              <span
                key={amount.value}
                className={cn(
                  "flex h-10 items-center justify-center rounded-md border text-[0.8125rem] font-medium tabular-nums",
                  amount.selected && "border-primary bg-primary/5 text-primary",
                )}
              >
                {amount.value}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{data.note}</p>
        <PayButton>{data.pay}</PayButton>
      </div>
    </Window>
  );
}

export type EmailData = { endpoint: string; request: string; response: string };

/** An API call: the request body and the 202 response with its request ID. */
export function EmailScreen({ data }: { data: EmailData }) {
  return (
    <Window title={data.endpoint} meta={<StatusPill tone="neutral">202 Accepted</StatusPill>}>
      <CodeBlock code={data.request} className="border-b" />
      <CodeBlock code={data.response} className="bg-muted/60" />
    </Window>
  );
}

export type EventData = { name: string; detail: string; time: string; current?: boolean }[];

/** Webhook deliveries for one message: event name, delivery result and time. */
export function EventsScreen({
  events,
  title = "Webhook deliveries",
}: {
  events: EventData;
  title?: string;
}) {
  return (
    <Window title={title} meta={<StatusPill>Signed</StatusPill>}>
      <ul className="divide-y">
        {events.map((event) => (
          <li key={event.name} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="flex flex-col">
              <span className="font-mono text-[0.78125rem]">{event.name}</span>
              <span className="text-xs text-muted-foreground">{event.detail}</span>
            </span>
            <span
              className={cn(
                "font-mono text-xs tabular-nums",
                event.current ? "text-primary" : "text-muted-foreground",
              )}
            >
              {event.time}
            </span>
          </li>
        ))}
      </ul>
    </Window>
  );
}

export type DomainData = {
  workspace: string;
  domains: { name: string; status: "Verified" | "Pending"; records: string }[];
};

/** Sending domains for a workspace and whether each is verified. */
export function DomainsScreen({ data }: { data: DomainData }) {
  return (
    <Window title={data.workspace}>
      <div className="flex items-center justify-between border-b px-5 py-3 text-xs font-medium text-muted-foreground">
        <span>Sending domains</span>
        <span>Status</span>
      </div>
      <ul className="divide-y">
        {data.domains.map((domain) => (
          <li key={domain.name} className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{domain.name}</span>
              <span className="text-xs text-muted-foreground">{domain.records}</span>
            </span>
            <StatusPill tone={domain.status === "Verified" ? "active" : "neutral"}>
              {domain.status}
            </StatusPill>
          </li>
        ))}
      </ul>
      <div className="border-t bg-muted/60 px-5 py-4 text-xs leading-5 text-muted-foreground">
        Production sends are blocked until a domain is verified.
      </div>
    </Window>
  );
}

export type UsageData = {
  period: string;
  cap: { used: string; limit: string; percent: number };
  keys: { name: string; sends: string; percent: number }[];
};

/** Usage for a workspace: spend against the cap, then sends per API key. */
export function UsageScreen({ data }: { data: UsageData }) {
  return (
    <Window title="Usage" meta={<StatusPill tone="neutral">{data.period}</StatusPill>}>
      <div className="flex flex-col gap-2 border-b p-5">
        <div className="flex items-baseline justify-between text-[0.8125rem]">
          <span className="text-muted-foreground">Spend this month</span>
          <span>
            <span className="text-lg font-semibold tracking-[-0.02em] tabular-nums">
              {data.cap.used}
            </span>
            <span className="text-muted-foreground"> / {data.cap.limit} cap</span>
          </span>
        </div>
        <div className="h-1.5 bg-muted">
          <div className="h-full bg-primary" style={{ width: `${data.cap.percent}%` }} />
        </div>
      </div>
      <ul className="flex flex-col gap-3.5 p-5">
        {data.keys.map((key) => (
          <li key={key.name} className="flex flex-col gap-1.5 text-[0.8125rem]">
            <span className="flex justify-between">
              <span className="font-mono text-xs">{key.name}</span>
              <span className="text-muted-foreground tabular-nums">{key.sends}</span>
            </span>
            <span className="h-1 bg-muted">
              <span
                className="block h-full bg-foreground/70"
                style={{ width: `${key.percent}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </Window>
  );
}
