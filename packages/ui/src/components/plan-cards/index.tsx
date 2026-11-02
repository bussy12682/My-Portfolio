import { ActionButton } from "@rektinasub/ui/components/actions";
import { Reveal } from "@rektinasub/ui/components/motion";
import { Eyebrow, typeScale } from "@rektinasub/ui/components/typography";
import { isPlanned, type ActionLink } from "@rektinasub/ui/lib/links";
import { cn } from "cn";
import { CheckIcon } from "lucide-react";

export type PlanCard = {
  eyebrow: string;
  name: string;
  description: string;
  /** The headline figure or model, e.g. "Listed price". Never invent a number that isn't set. */
  price: string;
  /** Small line under the price, e.g. "per top-up, no subscription". */
  priceNote?: string;
  points: string[];
  action?: ActionLink;
  /** Gives the card the blue top rule. Use on one card at most. */
  featured?: boolean;
};

/**
 * Pricing columns: bordered, square, separated by hairlines. Eyebrow, 32px name, copy, the price
 * model in 44px, a checklist and one action.
 */
export function PlanCards({
  plans,
  showPlanned = false,
  className,
}: {
  plans: PlanCard[];
  showPlanned?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid border md:auto-cols-fr md:grid-flow-col", className)}>
      {plans.map((plan, index) => {
        const action =
          plan.action && (showPlanned || !isPlanned(plan.action)) ? plan.action : undefined;
        return (
          <Reveal
            as="article"
            key={plan.name}
            delay={index * 100}
            className={cn(
              "relative flex flex-col border-t p-6 first:border-t-0 sm:p-8 md:border-t-0 md:border-l md:first:border-l-0",
              plan.featured &&
                "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary",
            )}
          >
            <Eyebrow>{plan.eyebrow}</Eyebrow>
            <h3 className={cn(typeScale.heading, "mt-4")}>{plan.name}</h3>
            <p className={cn(typeScale.body, "mt-3 max-w-[28rem]")}>{plan.description}</p>
            <p className="mt-8 border-t pt-8 font-heading text-[2.25rem] leading-none font-semibold tracking-[-0.035em] sm:text-[2.75rem]">
              {plan.price}
            </p>
            {plan.priceNote && (
              <p className="mt-3 text-sm text-muted-foreground">{plan.priceNote}</p>
            )}
            <ul className="mt-8 flex flex-col gap-3">
              {plan.points.map((point) => (
                <li key={point} className="flex gap-3 text-base leading-6 text-foreground/85">
                  <CheckIcon
                    aria-hidden
                    className="mt-1 size-4 shrink-0 text-orbital"
                    strokeWidth={2.25}
                  />
                  {point}
                </li>
              ))}
            </ul>
            {action && (
              <ActionButton
                action={action}
                size="lg"
                fallbackVariant={plan.featured ? "default" : "contrast"}
                className="mt-10 self-start"
              />
            )}
          </Reveal>
        );
      })}
    </div>
  );
}
