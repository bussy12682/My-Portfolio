"use client";

import { Accordion } from "@base-ui/react/accordion";
import { DisclosureMark } from "@rektinasub/ui/components/disclosure";
import { Reveal } from "@rektinasub/ui/components/motion";
import { cn } from "cn";

export type FaqItem = { question: string; answer: string };

/**
 * Questions as hairline-separated rows: 22px semibold questions, a 20px blue mark, 16px answers.
 * Several can be open at once.
 */
export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <Accordion.Root multiple className={cn("border-b", className)}>
      {items.map((item, index) => (
        <Reveal key={item.question} delay={index * 60} className="border-t">
          <Accordion.Item value={item.question}>
            <Accordion.Header>
              <Accordion.Trigger className="group/disclosure flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left text-[1.1875rem] leading-[1.3] font-semibold tracking-[-0.02em] outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-[1.375rem]">
                {item.question}
                <DisclosureMark size="sm" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-300 ease-out data-ending-style:h-0 data-starting-style:h-0">
              <p className="max-w-[44rem] pb-7 text-base leading-[1.6] text-pretty text-muted-foreground">
                {item.answer}
              </p>
            </Accordion.Panel>
          </Accordion.Item>
        </Reveal>
      ))}
    </Accordion.Root>
  );
}
