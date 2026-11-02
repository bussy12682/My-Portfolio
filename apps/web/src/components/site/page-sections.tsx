import { CtaBand, type CtaBandProps } from "@rektinasub/ui/components/cta-band";
import { Faq, type FaqItem } from "@rektinasub/ui/components/faq";
import { Hero, type HeroProps } from "@rektinasub/ui/components/hero";
import { Section, SectionHeader } from "@rektinasub/ui/components/layout";
import { Stage } from "@rektinasub/ui/components/showcase";
import { StepList, type StepItem } from "@rektinasub/ui/components/step-list";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

/**
 * Page-level compositions shared by the interior pages, so every page uses the same rhythm:
 * hero → content sections → FAQ → closing band.
 */

const showPlanned = siteConfig.showPlannedLinks;

/** The interior-page hero: the home hero's type and spacing, with a product screen on a 4:3 stage. */
export function PageHero({
  visual,
  ...hero
}: Omit<HeroProps, "aside" | "showPlanned"> & { visual?: ReactNode }) {
  return (
    <Hero
      {...hero}
      showPlanned={showPlanned}
      aside={visual ? <Stage className="aspect-[4/3]">{visual}</Stage> : undefined}
    />
  );
}

export function StepsSection({
  id,
  eyebrow,
  title,
  items,
  surface,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  items: StepItem[];
  surface?: "default" | "subtle";
}) {
  return (
    <Section id={id} surface={surface} className="scroll-mt-24 border-t">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)] lg:gap-16">
        <SectionHeader eyebrow={eyebrow} title={title} align="start" />
        <StepList items={items} />
      </div>
    </Section>
  );
}

export function FaqSection({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: FaqItem[];
}) {
  return (
    <Section id="faq" className="scroll-mt-24 border-t">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          align="start"
          className="lg:sticky lg:top-32 lg:self-start"
        />
        <Faq items={items} />
      </div>
    </Section>
  );
}

export function ClosingBand(props: Omit<CtaBandProps, "showPlanned">) {
  return <CtaBand {...props} showPlanned={showPlanned} />;
}
