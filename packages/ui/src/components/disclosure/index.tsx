import { cn } from "cn";

/**
 * The reference's open/close mark: a blue plus whose vertical bar collapses into a minus when
 * the parent `group/disclosure` is expanded (`aria-expanded`). Drawn from two bars so the
 * stroke and size are exact: `lg` is 32px with a 2.7px stroke, `sm` 20px with 2px.
 */
export function DisclosureMark({
  size = "lg",
  className,
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const bar = size === "lg" ? "h-[0.16875rem]" : "h-0.5";
  return (
    <span
      aria-hidden
      className={cn(
        "relative shrink-0 text-orbital",
        size === "lg" ? "size-6 sm:size-8" : "size-5",
        className,
      )}
    >
      <span className={cn("absolute inset-x-0 top-1/2 -translate-y-1/2 bg-current", bar)} />
      <span
        className={cn(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 rotate-90 bg-current transition-transform duration-300 group-aria-expanded/disclosure:scale-x-0",
          bar,
        )}
      />
    </span>
  );
}
