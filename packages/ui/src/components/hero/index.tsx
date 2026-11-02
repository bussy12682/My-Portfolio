import { Actions } from "@rektinasub/ui/components/actions";
import { Container } from "@rektinasub/ui/components/layout";
import { Eyebrow, typeScale } from "@rektinasub/ui/components/typography";
import type { ActionLink } from "@rektinasub/ui/lib/links";
import { enter } from "@rektinasub/ui/lib/motion";
import { cn } from "cn";
import type { ReactNode } from "react";

export { HeroShowcase, type HeroShowcaseProps, type HeroSlide } from "./hero-showcase";

/** One stat in the row under the hero actions: a bold figure followed by a muted label. */
export type HeroStat = { value: string; label: string };

export type HeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ActionLink[];
  stats?: HeroStat[];
  /** Right column, usually a `HeroShowcase`. Aligned to the top of the eyebrow. */
  aside?: ReactNode;
  showPlanned?: boolean;
  className?: string;
};

/**
 * Page opener, measured from the design reference: 12px eyebrow, 80px headline, 18px lead,
 * 40px buttons and a 16px stat row. The aside is 416px wide on large screens.
 */
export function Hero({
  eyebrow,
  title,
  description,
  actions = [],
  stats,
  aside,
  showPlanned,
  className,
}: HeroProps) {
  return (
    <section className={cn("bg-background", className)}>
      <Container className="grid gap-14 pt-12 pb-14 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16 lg:pt-[1.375rem] lg:pb-12">
        <div className="flex flex-col lg:pt-[0.3125rem]">
          {eyebrow && (
            <Eyebrow className={cn("mb-5 lg:mb-[1.1875rem]", enter(0))}>{eyebrow}</Eyebrow>
          )}
          <h1 className={cn(typeScale.display, "max-w-[11.5em]", enter(1))}>{title}</h1>
          {description && (
            <p
              className={cn(
                typeScale.lead,
                "mt-6 max-w-[37rem] text-foreground/80 lg:mt-[0.6875rem]",
                enter(2),
              )}
            >
              {description}
            </p>
          )}
          <Actions
            actions={actions}
            size="lg"
            showPlanned={showPlanned}
            className={cn("mt-8 lg:mt-[1.875rem]", enter(3))}
          />
          {stats && stats.length > 0 && (
            <ul
              className={cn(
                "mt-12 flex flex-wrap gap-x-6 gap-y-2 text-base leading-6 lg:mt-[2.875rem]",
                enter(4),
              )}
            >
              {stats.map((stat) => (
                <li key={stat.label}>
                  <span className="font-semibold text-foreground">{stat.value}</span>{" "}
                  <span className="text-foreground/75">{stat.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {aside && <div className={cn("lg:pt-[1.1875rem]", enter(3))}>{aside}</div>}
      </Container>
    </section>
  );
}
