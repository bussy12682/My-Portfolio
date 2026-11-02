import { Section } from "@rektinasub/ui/components/layout";
import { CodeBlock, StatusPill, Window } from "@rektinasub/ui/components/showcase";
import { StoryCard } from "@rektinasub/ui/components/story-card";
import type { Metadata } from "next";
import { ClosingBand, FaqSection, PageHero, StepsSection } from "@/components/site/page-sections";
import { EmailScreen, EventsScreen, StageScreen } from "@/components/site/previews";
import { screens } from "@/config/home";
import { emailApiPage as page } from "@/config/pages/developers";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = page.meta;

export default function EmailApiPage() {
  return (
    <>
      <PageHero
        {...page.hero}
        visual={
          <StageScreen scale={0.82}>
            <EmailScreen data={screens.email} />
          </StageScreen>
        }
      />
      <StepsSection {...page.steps} />
      <Section className="pt-0 sm:pt-0 lg:pt-0">
        <div className="flex flex-col gap-6">
          <StoryCard
            {...page.story}
            showPlanned={siteConfig.showPlannedLinks}
            visual={
              <StageScreen width="28rem">
                <Window title="POST /v1/emails" meta={<StatusPill tone="neutral">422</StatusPill>}>
                  <CodeBlock code={page.errorCode} />
                </Window>
              </StageScreen>
            }
          />
          <StoryCard
            {...page.events}
            showPlanned={siteConfig.showPlannedLinks}
            visual={
              <StageScreen width="26rem">
                <EventsScreen events={screens.events} />
              </StageScreen>
            }
          />
        </div>
      </Section>
      <FaqSection {...page.faq} />
      <ClosingBand {...page.closing} />
    </>
  );
}
