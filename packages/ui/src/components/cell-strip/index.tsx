import { Container } from "@rektinasub/ui/components/layout";
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";

export type CellItem = { label: string; icon?: LucideIcon };

/**
 * A row of equal cells between full-bleed hairlines (the reference's logo strip): 72px tall,
 * 1px dividers aligned to the container. Scrolls sideways on small screens instead of wrapping.
 */
export function CellStrip({ items, className }: { items: CellItem[]; className?: string }) {
  return (
    <div className={cn("border-y", className)}>
      <Container className="px-0 sm:px-8 lg:px-10">
        <ul className="flex snap-x [scrollbar-width:none] overflow-x-auto sm:border-l lg:grid lg:auto-cols-fr lg:grid-flow-col lg:overflow-visible">
          {items.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="group/cell flex h-[4.5rem] min-w-[11rem] shrink-0 snap-start items-center justify-center gap-2.5 border-r px-6 text-[1.1875rem] font-semibold tracking-[-0.025em] whitespace-nowrap text-foreground/75 transition-colors duration-300 hover:bg-card hover:text-foreground lg:min-w-0"
            >
              {Icon && (
                <Icon
                  aria-hidden
                  className="size-5 text-foreground/60 transition-colors duration-300 group-hover/cell:text-orbital"
                  strokeWidth={2}
                />
              )}
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
