import { CellStrip } from "@rektinasub/ui/components/cell-strip";
import { CtaBand } from "@rektinasub/ui/components/cta-band";
import { Faq } from "@rektinasub/ui/components/faq";
import { FeaturePanels } from "@rektinasub/ui/components/feature-panels";
import { Hero, HeroShowcase } from "@rektinasub/ui/components/hero";
import { Section, SectionHeader } from "@rektinasub/ui/components/layout";
import { ServiceList } from "@rektinasub/ui/components/service-list";
import { StoryCard } from "@rektinasub/ui/components/story-card";
import {
  AirtimeScreen,
  EmailScreen,
  EventsScreen,
  PlanScreen,
  ReceiptScreen,
  StageScreen,
  UsageScreen,
} from "@/components/site/previews";
import { homeContent as home, screens } from "@/config/home";
import { siteConfig } from "@/config/site";

const showPlanned = siteConfig.showPlannedLinks;

/** Hero screens are scaled to fit the 416px "now showing" stage. */
const heroVisuals = [
  <StageScreen key="receipt" width="24rem" scale={0.7}>
    <ReceiptScreen order={screens.receipt} />
  </StageScreen>,
  <StageScreen key="plans" width="24rem" scale={0.7}>
    <PlanScreen data={screens.plans} />
  </StageScreen>,
  <StageScreen key="email" width="26rem" scale={0.66}>
    <EmailScreen data={screens.email} />
  </StageScreen>,
];

const serviceVisuals = {
  airtime: <AirtimeScreen data={screens.airtime} />,
  data: <PlanScreen data={screens.plans} />,
  email: <EmailScreen data={screens.email} />,
  webhooks: <EventsScreen events={screens.events} />,
  usage: <UsageScreen data={screens.usage} />,
};

const storyVisuals = [
  <StageScreen key="receipt" width="25rem">
    <ReceiptScreen order={screens.receipt} />
  </StageScreen>,
  <StageScreen key="email" width="28rem" className="top-[7%]">
    <div className="flex flex-col gap-3">
      <EmailScreen data={screens.email} />
      <EventsScreen events={screens.events} />
    </div>
  </StageScreen>,
];

/**
 * Hero → strip → services (numbered rows) → audience panels → two journeys → FAQ → closing.
 * Layout and type are measured from the design reference (designme.agency); content is REKTINA's.
 */
export default function HomePage() {
  const { hero, services, stories, faq } = home;

  return (
    <>
      <Hero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
        stats={hero.stats}
        showPlanned={showPlanned}
        aside={
          <HeroShowcase
            label={hero.showcase.label}
            link={hero.showcase.link}
            slides={hero.showcase.slides.map((slide, index) => ({
              ...slide,
              visual: heroVisuals[index],
            }))}
            showPlanned={showPlanned}
          />
        }
      />

      <CellStrip items={home.strip} />

      <Section id={services.id} className="scroll-mt-24">
        <SectionHeader
          eyebrow={services.eyebrow}
          title={services.title}
          description={services.description}
        />
        <ServiceList
          className="mt-16 lg:mt-[4.5rem]"
          showPlanned={showPlanned}
          items={services.items.map((item) => ({
            ...item,
            visual: (
              <StageScreen>{serviceVisuals[item.id as keyof typeof serviceVisuals]}</StageScreen>
            ),
          }))}
        />
      </Section>

      <Section spacing="none" className="pb-20 sm:pb-24 lg:pb-30">
        <FeaturePanels panels={home.panels} showPlanned={showPlanned} />
      </Section>

      <Section id={stories.id} className="scroll-mt-24 pt-0 sm:pt-0 lg:pt-0">
        <SectionHeader eyebrow={stories.eyebrow} title={stories.title} />
        <div className="mt-16 flex flex-col gap-6 lg:mt-[4.5rem]">
          {stories.items.map((story, index) => (
            <StoryCard
              key={story.title}
              {...story}
              visual={storyVisuals[index]}
              showPlanned={showPlanned}
            />
          ))}
        </div>
      </Section>

      <Section id={faq.id} className="scroll-mt-24 border-t">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
          <SectionHeader
            eyebrow={faq.eyebrow}
            title={faq.title}
            align="start"
            className="lg:sticky lg:top-32 lg:self-start"
          />
          <Faq items={faq.items} />
        </div>
      </Section>

      <CtaBand {...home.closing} showPlanned={showPlanned} />
    </>
  );
}
