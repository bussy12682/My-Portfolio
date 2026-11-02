import { Reveal } from "@rektinasub/ui/components/motion";
import { typeScale } from "@rektinasub/ui/components/typography";
import { cn } from "cn";

export type StepItem = { title: string; description: string };

/**
 * Static numbered rows in the same rhythm as `ServiceList` (hairlines, a 136px number column):
 * a 32px number and title on the left, 16px copy on the right. For sequences and principles that
 * don't need to open.
 */
export function StepList({ items, className }: { items: StepItem[]; className?: string }) {
  return (
    <ol className={cn("border-b", className)}>
      {items.map((item, index) => (
        <Reveal
          as="li"
          key={item.title}
          delay={index * 80}
          className="grid gap-3 border-t py-8 sm:grid-cols-[4.5rem_minmax(0,1fr)] lg:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-0 lg:py-10"
        >
          <span className={cn(typeScale.heading, "text-muted-foreground tabular-nums")}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className={cn(typeScale.heading, "lg:pr-12")}>{item.title}</h3>
          <p className="text-base leading-[1.6] text-pretty text-foreground/75 sm:col-start-2 lg:col-start-auto lg:max-w-[34rem] lg:pt-1.5 lg:text-[1.0625rem]">
            {item.description}
          </p>
        </Reveal>
      ))}
    </ol>
  );
}
