"use client";

import { Accordion } from "@base-ui/react/accordion";
import { TextLink } from "@rektinasub/ui/components/actions";
import { DisclosureMark } from "@rektinasub/ui/components/disclosure";
import { Reveal } from "@rektinasub/ui/components/motion";
import { Stage } from "@rektinasub/ui/components/showcase";
import { typeScale } from "@rektinasub/ui/components/typography";
import type { LinkItem } from "@rektinasub/ui/lib/links";
import { cn } from "cn";
import type { ReactNode } from "react";

export type ServiceItem = {
  id: string;
  title: string;
  /** The emphasised paragraph beside the visual. */
  summary: string;
  points?: string[];
  link?: LinkItem;
  /** A product screen; it sits on a 4:3 light stage. */
  visual?: ReactNode;
};

export type ServiceListProps = {
  items: ServiceItem[];
  /** Item open on load. Defaults to the first. */
  defaultOpen?: string;
  showPlanned?: boolean;
  className?: string;
};

/**
 * Numbered rows that open one at a time (design reference, "How we help"). Collapsed rows are
 * 97px: 44px numbers and titles, the title starting 136px in, a 32px blue mark on the right.
 * An open row shows a 4:3 stage on the left half and the summary, points and link on the right.
 */
export function ServiceList({
  items,
  defaultOpen,
  showPlanned = false,
  className,
}: ServiceListProps) {
  return (
    <Accordion.Root
      defaultValue={[defaultOpen ?? items[0]?.id]}
      className={cn("flex flex-col", className)}
    >
      {items.map((item, index) => (
        <Reveal key={item.id} delay={index * 70} className="border-t first:border-t-0">
          <Accordion.Item value={item.id}>
            <Accordion.Header>
              <Accordion.Trigger className="group/disclosure flex w-full cursor-pointer items-center gap-4 py-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:py-[1.65625rem] lg:grid lg:grid-cols-[8.5rem_minmax(0,1fr)_auto] lg:gap-0">
                <span className={cn(typeScale.row, "w-12 shrink-0 tabular-nums sm:w-20 lg:w-auto")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    typeScale.row,
                    "flex-1 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/disclosure:translate-x-1.5",
                  )}
                >
                  {item.title}
                </span>
                <DisclosureMark />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-300 ease-out data-ending-style:h-0 data-starting-style:h-0">
              <div className="grid gap-8 pt-2 pb-8 lg:grid-cols-[calc(50%-1rem)_minmax(0,1fr)] lg:gap-x-4 lg:pt-1">
                {item.visual && <Stage className="aspect-[4/3]">{item.visual}</Stage>}
                <div className="flex flex-col lg:pr-14">
                  <p className={cn(typeScale.strong, "max-w-[34rem]")}>{item.summary}</p>
                  {item.points && (
                    <ul className="mt-8 list-disc pl-6 marker:text-foreground/50">
                      {item.points.map((point) => (
                        <li key={point} className={cn(typeScale.list, "pl-1")}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                  {item.link && (
                    <TextLink
                      link={item.link}
                      showPlanned={showPlanned}
                      className="mt-10 lg:mt-auto"
                    />
                  )}
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Reveal>
      ))}
    </Accordion.Root>
  );
}
