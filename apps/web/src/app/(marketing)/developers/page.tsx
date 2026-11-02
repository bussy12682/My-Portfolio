import { Section, SectionHeader } from "@rektinasub/ui/components/layout";
import { ServiceList } from "@rektinasub/ui/components/service-list";
import { StoryCard } from "@rektinasub/ui/components/story-card";
import type { Metadata } from "next";
import { ClosingBand, FaqSection, PageHero, StepsSection } from "@/components/site/page-sections";
import {
  DomainsScreen,
  EmailScreen,
  EventsScreen,
  StageScreen,
  UsageScreen,
} from "@/components/site/previews";
import { screens } from "@/config/home";
import { developersPage as page, domains } from "@/config/pages/developers";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = page.meta;

const visuals = {
  email: <EmailScreen data={screens.email} />,
  domains: <DomainsScreen data={domains} />,
  webhooks: <EventsScreen events={screens.events} />,
  usage: <UsageScreen data={screens.usage} />,
};

export default function DevelopersPage() {
  const { capabilities } = page;

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
      <Section className="border-t">
        <SectionHeader
          eyebrow={capabilities.eyebrow}
          title={capabilities.title}
          description={capabilities.description}
        />
        <ServiceList
          className="mt-16 lg:mt-[4.5rem]"
          showPlanned={siteConfig.showPlannedLinks}
          items={capabilities.items.map((item) => ({
            ...item,
            visual: <StageScreen>{visuals[item.id as keyof typeof visuals]}</StageScreen>,
          }))}
        />
      </Section>
      <StepsSection {...page.steps} />
      <Section className="pt-0 sm:pt-0 lg:pt-0">
        <StoryCard
          {...page.story}
          showPlanned={siteConfig.showPlannedLinks}
          visual={
            <StageScreen width="28rem" className="top-[7%]">
              <div className="flex flex-col gap-3">
                <EmailScreen data={screens.email} />
                <EventsScreen events={screens.events} />
              </div>
            </StageScreen>
          }
        />
      </Section>
      <FaqSection {...page.faq} />
      <ClosingBand {...page.closing} />
    </>
  );
}
