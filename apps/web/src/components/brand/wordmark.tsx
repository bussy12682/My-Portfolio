import { cn } from "@rektinasub/ui/lib/utils";
import Image from "next/image";
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
      className={cn(
        "inline-flex gap-1.5 text-foreground",
        brand === "rektina" ? "items-center" : "items-baseline",
        className,
      )}
    >
      {brand === "rektina" ? (
        <Image
          src="/brand/rektina-wordmark.png"
          alt=""
          width={781}
          height={264}
          className="h-12 w-auto"
        />
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
