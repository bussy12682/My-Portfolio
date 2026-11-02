import { cn } from "@rektinasub/ui/lib/utils";
import Link from "next/link";

type WordmarkProps = {
  /** `rektina` is the consumer brand; `permitt` is the developer-facing identity (Permitt brief §1). */
  brand?: "rektina" | "permitt";
  href?: string;
  className?: string;
};

/**
 * Typographic stand-in until the final logo (satellite symbol, transparent SVG) is supplied.
 * Swap the inner markup for the SVG; every placement already goes through this component.
 */
export function Wordmark({ brand = "rektina", href = "/", className }: WordmarkProps) {
  return (
    <Link
      href={href}
      aria-label={brand === "rektina" ? "REKTINA.sub home" : "Permitt by REKTINA home"}
      className={cn(
        "inline-flex items-baseline gap-1.5 font-heading text-[1.3125rem] leading-none font-bold tracking-[-0.045em] text-foreground",
        className,
      )}
    >
      {brand === "rektina" ? (
        <span>
          REKTINA<span className="text-orbital">.sub</span>
        </span>
      ) : (
        <>
          <span>Permitt</span>
          <span className="text-xs font-normal text-muted-foreground">by REKTINA</span>
        </>
      )}
    </Link>
  );
}
