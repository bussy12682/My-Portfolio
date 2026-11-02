import { FeaturePanels } from "@rektinasub/ui/components/feature-panels";
import { Section } from "@rektinasub/ui/components/layout";
import type { Metadata } from "next";
import { ClosingBand, PageHero, StepsSection } from "@/components/site/page-sections";
import { aboutPage as page } from "@/config/pages/company";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = page.meta;

export default function AboutPage() {
  return (
    <>
      <PageHero {...page.hero} />
      <StepsSection {...page.principles} />
      <Section className="pt-0 sm:pt-0 lg:pt-0">
        <FeaturePanels panels={page.panels} showPlanned={siteConfig.showPlannedLinks} />
      </Section>
      <ClosingBand {...page.closing} />
    </>
  );
}
