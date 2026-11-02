import { cn } from "cn";
import type { ComponentProps } from "react";

/**
 * The type scale, measured from the design reference (designme.agency, 1500px viewport) and
 * converted for Host Grotesk (cap height 0.72em) so cap heights match the reference.
 * Headings are semibold with tight tracking; body copy is regular. Sizes step down on small screens.
 */
export const typeScale = {
  /** Hero headline: 80px, line-height 0.98 (reference cap height 57px, line pitch 78.6px). */
  display:
    "font-heading text-[2.75rem] leading-[1] font-semibold tracking-[-0.04em] text-balance sm:text-[3.75rem] lg:text-[5rem] lg:leading-[0.98]",
  /** Closing headline: 74px, line-height 1.05. */
  closing:
    "font-heading text-[2.625rem] leading-[1.04] font-semibold tracking-[-0.04em] text-balance sm:text-[3.5rem] lg:text-[4.625rem] lg:leading-[1.05]",
  /** Section headline: 58px, line-height 1.1 (cap 41px, pitch 64px). */
  title:
    "font-heading text-[2.25rem] leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-[2.875rem] lg:text-[3.625rem] lg:leading-[1.1]",
  /** Numbered row heading: 43px, line-height 1 (cap 31px). */
  row: "font-heading text-[1.625rem] leading-none font-semibold tracking-[-0.03em] sm:text-[2.25rem] lg:text-[2.6875rem]",
  /** Panel and statement heading: 32px, line-height 1.15 (cap 23px). */
  heading:
    "font-heading text-[1.625rem] leading-[1.15] font-semibold tracking-[-0.025em] text-balance sm:text-[2rem]",
  /** Card heading: 20px, line-height 1.3. */
  subtitle:
    "font-heading text-[1.1875rem] leading-[1.3] font-semibold tracking-[-0.015em] text-balance sm:text-[1.25rem]",
  /** Supporting paragraph under a headline: 18px, line-height 1.5. */
  lead: "text-[1.0625rem] leading-[1.55] text-pretty sm:text-[1.125rem] sm:leading-[1.5]",
  /** Emphasised paragraph (service detail): 19px semibold, line-height 1.3. */
  strong:
    "text-[1.0625rem] leading-[1.35] font-semibold tracking-[-0.01em] text-pretty sm:text-[1.1875rem] sm:leading-[1.3]",
  /** Body copy: 16px, line-height 1.47, muted. */
  body: "text-base leading-[1.47] text-pretty text-muted-foreground",
  /** List items: 16px on a 28px pitch. */
  list: "text-base leading-7 text-foreground/80",
} as const;

/** Small uppercase label above headlines: 12px, medium, tracked, muted. No decoration. */
export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-xs leading-4 font-medium tracking-[0.08em] text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}
