import { Section } from "@rektinasub/ui/components/layout";
import { StoryCard } from "@rektinasub/ui/components/story-card";
import type { Metadata } from "next";
import { ClosingBand, FaqSection, PageHero, StepsSection } from "@/components/site/page-sections";
import { PlanScreen, ReceiptScreen, StageScreen } from "@/components/site/previews";
import { screens } from "@/config/home";
import { dataPage as page } from "@/config/pages/personal";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = page.meta;

export default function DataPage() {
  return (
    <>
      <PageHero
        {...page.hero}
        visual={
          <StageScreen scale={0.82}>
            <PlanScreen data={screens.plans} />
          </StageScreen>
        }
      />
      <StepsSection {...page.steps} />
      <Section className="pt-0 sm:pt-0 lg:pt-0">
        <StoryCard
          {...page.story}
          showPlanned={siteConfig.showPlannedLinks}
          visual={
            <StageScreen width="25rem">
              <ReceiptScreen order={screens.receipt} />
            </StageScreen>
          }
        />
      </Section>
      <FaqSection {...page.faq} />
      <ClosingBand {...page.closing} />
    </>
  );
}
