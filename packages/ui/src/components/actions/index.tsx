import { SmartLink } from "@rektinasub/ui/components/adapters";
import { Button } from "@rektinasub/ui/components/ui/button";
import { isPlanned, visibleLinks, type ActionLink, type LinkItem } from "@rektinasub/ui/lib/links";
import { cn } from "cn";
import { ArrowRightIcon } from "lucide-react";

type ActionsProps = {
  actions: ActionLink[];
  size?: "default" | "sm" | "lg";
  showPlanned?: boolean;
  onNavigate?: () => void;
  className?: string;
};

/**
 * A row of link buttons, 8px apart. The first action defaults to `default` (blue); later ones
 * default to `contrast` (white on dark), as in the design reference.
 */
export function Actions({
  actions,
  size = "default",
  showPlanned = false,
  onNavigate,
  className,
}: ActionsProps) {
  const visible = visibleLinks(actions, showPlanned);
  if (!visible.length) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {visible.map((action, index) => (
        <ActionButton
          key={action.href}
          action={action}
          size={size}
          fallbackVariant={index === 0 ? "default" : "contrast"}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

export function ActionButton({
  action,
  size = "default",
  fallbackVariant = "default",
  onNavigate,
  className,
}: {
  action: ActionLink;
  size?: ActionsProps["size"];
  fallbackVariant?: NonNullable<ActionLink["variant"]>;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Button
      size={size}
      variant={action.variant ?? fallbackVariant}
      nativeButton={false}
      render={<SmartLink href={action.href} external={action.external} onClick={onNavigate} />}
      className={className}
    >
      {action.label}
      {action.trailing === "arrow" && (
        <ArrowRightIcon
          data-icon="inline-end"
          className="transition-transform duration-300 group-hover/button:translate-x-0.5"
        />
      )}
    </Button>
  );
}

/**
 * The underlined text link with a trailing arrow ("View case study →"): 15px semibold,
 * a 1px rule 4px under the baseline. Hidden when the link is planned and `showPlanned` is off.
 */
export function TextLink({
  link,
  showPlanned = false,
  className,
}: {
  link: LinkItem;
  showPlanned?: boolean;
  className?: string;
}) {
  if (!showPlanned && isPlanned(link)) return null;

  return (
    <SmartLink
      href={link.href}
      external={link.external}
      className={cn(
        "group/text-link inline-flex w-fit items-center gap-1.5 text-[0.9375rem] leading-6 font-semibold tracking-[-0.005em] text-foreground underline decoration-foreground/90 decoration-1 underline-offset-[5px] transition-colors hover:decoration-orbital",
        className,
      )}
    >
      {link.label}
      <ArrowRightIcon
        aria-hidden
        className="size-4 transition-transform group-hover/text-link:translate-x-0.5"
        strokeWidth={2.25}
      />
    </SmartLink>
  );
}
