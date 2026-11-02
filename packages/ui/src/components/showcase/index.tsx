import { cn } from "cn";
import { CheckIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

/**
 * Showcase foundations: the pieces apps use to draw their own product screens (receipts, plan
 * pickers, API calls) and present them on light panels, the way the design reference presents
 * case-study screens.
 */

/**
 * A light panel that holds a product screen. Always renders the light token set, even inside the
 * dark page. Screens are usually anchored to the bottom and cropped, like a device photographed
 * from above.
 */
export function Stage({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("light relative isolate overflow-hidden bg-muted text-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type WindowProps = ComponentProps<"div"> & {
  /** Label in the title bar, e.g. an order ID or an endpoint. */
  title?: ReactNode;
  /** Right side of the title bar, e.g. a `StatusPill`. */
  meta?: ReactNode;
};

/** A product screen: white surface, hairline border, a quiet shadow and an optional title bar. */
export function Window({ title, meta, className, children, ...props }: WindowProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.05),0_12px_32px_-12px_rgb(0_0_0/0.14)]",
        className,
      )}
      {...props}
    >
      {(title || meta) && (
        <div className="flex h-10 items-center justify-between gap-4 border-b px-4">
          <span className="truncate text-[0.8125rem] font-medium text-muted-foreground">
            {title}
          </span>
          {meta}
        </div>
      )}
      {children}
    </div>
  );
}

/** A small square status label. `active` uses the brand blue; `neutral` stays grey. */
export function StatusPill({
  tone = "active",
  className,
  children,
}: {
  tone?: "active" | "neutral";
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-sm px-1.5 text-xs font-medium",
        tone === "active" ? "bg-orbital/10 text-orbital" : "bg-secondary text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export type TimelineItem = { label: string; meta?: string; state: "done" | "current" | "pending" };

/** A vertical progress list, e.g. the life of an order or a message. */
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {items.map((item, index) => (
        <li key={item.label} className="relative flex gap-3 pb-3.5 last:pb-0">
          {index < items.length - 1 && (
            <span aria-hidden className="absolute top-[1.125rem] bottom-0 left-2 w-px bg-border" />
          )}
          <span
            aria-hidden
            className={cn(
              "relative mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
              item.state === "done" && "border-orbital bg-orbital text-white",
              item.state === "current" && "border-orbital bg-background",
              item.state === "pending" && "bg-background",
            )}
          >
            {item.state === "done" && <CheckIcon className="size-2.5" strokeWidth={3} />}
            {item.state === "current" && <span className="size-1.5 rounded-full bg-orbital" />}
          </span>
          <span className="flex flex-1 items-baseline justify-between gap-4 text-[0.8125rem] leading-5">
            <span className={cn(item.state === "pending" && "text-muted-foreground")}>
              {item.label}
            </span>
            {item.meta && (
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {item.meta}
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

const tokenPattern =
  /("(?:[^"\\]|\\.)*")(\s*:)?|\b(POST|GET|PUT|PATCH|DELETE)\b|(\b\d+(?:\.\d+)?\b)/g;

/** Lightweight colouring for JSON and HTTP snippets: keys, strings, methods and numbers. */
function highlight(line: string) {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of line.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(line.slice(last, index));
    const [token, string, colon, method, number] = match;
    if (string && colon)
      nodes.push(
        <span key={index} className="text-foreground">
          {string}
        </span>,
        colon,
      );
    else if (string)
      nodes.push(
        <span key={index} className="text-orbital">
          {string}
        </span>,
      );
    else if (method)
      nodes.push(
        <span key={index} className="font-semibold text-foreground">
          {method}
        </span>,
      );
    else if (number)
      nodes.push(
        <span key={index} className="text-orbital">
          {number}
        </span>,
      );
    else nodes.push(token);
    last = index + token.length;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return nodes;
}

/** A read-only code sample. Pass plain text; colouring is applied per line. */
export function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <pre
      className={cn(
        "overflow-x-auto p-4 font-mono text-[0.78125rem] leading-[1.35rem] text-muted-foreground",
        className,
      )}
    >
      <code>
        {code.split("\n").map((line, index) => (
          <span key={index} className="block min-h-[1.35rem]">
            {highlight(line)}
          </span>
        ))}
      </code>
    </pre>
  );
}
