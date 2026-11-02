import { Actions } from "@rektinasub/ui/components/actions";
import { Container } from "@rektinasub/ui/components/layout";
import { Parallax, Reveal } from "@rektinasub/ui/components/motion";
import { Eyebrow, typeScale } from "@rektinasub/ui/components/typography";
import type { ActionLink } from "@rektinasub/ui/lib/links";
import type { ReactNode } from "react";

export type CtaBandProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions: ActionLink[];
  showPlanned?: boolean;
};

/**
 * The closing section (design reference): near-black, centred 14px eyebrow, 74px headline,
 * 18px lead and one 40px button, over a blue glow that rises from the bottom edge.
 */
export function CtaBand({ eyebrow, title, description, actions, showPlanned }: CtaBandProps) {
  return (
    <section className="relative isolate overflow-hidden bg-subtle text-foreground">
      <Container className="pt-24 pb-60 sm:pt-28 sm:pb-72 lg:pt-[7.5rem] lg:pb-[19rem]">
        <Reveal className="flex flex-col items-center text-center">
          {eyebrow && <Eyebrow className="mb-6 text-sm tracking-[0.06em]">{eyebrow}</Eyebrow>}
          <h2 className={`${typeScale.closing} whitespace-pre-line`}>{title}</h2>
          {description && (
            <p className="mt-6 max-w-[30rem] text-lg leading-[1.45] font-medium text-pretty">
              {description}
            </p>
          )}
          <Actions
            actions={actions}
            size="lg"
            showPlanned={showPlanned}
            className="mt-9 justify-center"
          />
        </Reveal>
      </Container>
      {/* Decorative glow: two soft blue masses anchored to the bottom edge. */}
      <Parallax speed={0.12} className="absolute inset-x-0 -bottom-16 -z-10">
        <div
          aria-hidden
          className="h-[26rem] bg-[radial-gradient(42%_75%_at_18%_100%,color-mix(in_oklch,var(--orbital)_85%,transparent),transparent_72%),radial-gradient(38%_70%_at_82%_100%,color-mix(in_oklch,var(--orbital)_80%,transparent),transparent_70%),radial-gradient(60%_45%_at_50%_100%,color-mix(in_oklch,var(--orbital)_35%,transparent),transparent_80%)] blur-2xl"
        />
      </Parallax>
    </section>
  );
}
