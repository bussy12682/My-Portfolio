import { cn } from "@rektinasub/ui/lib/utils";
import Link from "next/link";

type WordmarkProps = {
  /** `rektina` is the consumer brand; `permitt` is the developer-facing identity (Permitt brief §1). */
  brand?: "rektina" | "permitt";
  href?: string;
  className?: string;
};

export function Wordmark({ brand = "rektina", href = "/", className }: WordmarkProps) {
  return (
    <Link
      href={href}
      aria-label={brand === "rektina" ? "REKTINA.sub home" : "Permitt by REKTINA home"}
      className={cn("inline-flex items-baseline gap-1.5 text-foreground", className)}
    >
      {brand === "rektina" ? (
        <span className="font-[Segoe_Script,Brush_Script_MT,cursive] text-2xl leading-none font-normal tracking-normal">
          Rektina.sub
        </span>
      ) : (
        <>
          <span className="font-heading text-[1.3125rem] leading-none font-bold tracking-[-0.045em]">
            Permitt
          </span>
          <span className="text-xs font-normal text-muted-foreground">by REKTINA</span>
        </>
      )}
    </Link>
  );
}
