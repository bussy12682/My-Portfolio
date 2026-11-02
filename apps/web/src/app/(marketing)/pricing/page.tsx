import { Section } from "@rektinasub/ui/components/layout";
import { PlanCards } from "@rektinasub/ui/components/plan-cards";
import type { Metadata } from "next";
import { ClosingBand, FaqSection, PageHero } from "@/components/site/page-sections";
import { pricingPage as page } from "@/config/pages/company";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = page.meta;

export default function PricingPage() {
  return (
    <>
      <PageHero {...page.hero} />
      <Section className="pt-6 sm:pt-8 lg:pt-10">
        <PlanCards plans={page.plans} showPlanned={siteConfig.showPlannedLinks} />
      </Section>
      <FaqSection {...page.faq} />
      <ClosingBand {...page.closing} />
    </>
  );
}
