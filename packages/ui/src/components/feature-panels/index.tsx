import { TextLink } from "@rektinasub/ui/components/actions";
import { Reveal } from "@rektinasub/ui/components/motion";
import { Eyebrow, typeScale } from "@rektinasub/ui/components/typography";
import type { LinkItem } from "@rektinasub/ui/lib/links";
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";

export type FeaturePanel = {
  eyebrow?: string;
  title: string;
  description: string;
  link?: LinkItem;
  /** Icons shown as large marks (`plain`) or inside 84px tiles (`tiles`). */
  icons?: { icon: LucideIcon; label: string }[];
  iconStyle?: "plain" | "tiles";
  /** A soft brand-blue glow along the top edge. Use on one panel at most. */
  glow?: boolean;
};

/**
 * Two centred panels side by side (design reference, "Explore more services" / "Tools and
 * workflows"): #151515 fills, 440px tall, an 11:9 split with a 20px gap. Titles are 32px,
 * copy 18px, and the links share a bottom line.
 */
export function FeaturePanels({
  panels,
  showPlanned = false,
  className,
}: {
  panels: [FeaturePanel, FeaturePanel];
  showPlanned?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-5 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]", className)}>
      {panels.map((panel, index) => (
        <Reveal key={panel.title} delay={index * 100} className="flex">
          <article
            className={cn(
              "relative isolate flex min-h-[27.5rem] w-full flex-col items-center overflow-hidden bg-card px-6 pt-16 pb-12 text-center sm:px-10 lg:pt-[5.75rem] lg:pb-[2.75rem]",
              panel.glow &&
                "before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-56 before:bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklch,var(--orbital)_32%,transparent),transparent_75%)]",
            )}
          >
            {panel.icons && panel.iconStyle !== "tiles" && (
              <ul className="mb-11 flex items-center justify-center gap-8 sm:gap-10">
                {panel.icons.map(({ icon: Icon, label }) => (
                  <li key={label}>
                    <Icon
                      aria-label={label}
                      className="size-11 text-foreground sm:size-14"
                      strokeWidth={1.6}
                    />
                  </li>
                ))}
              </ul>
            )}
            {panel.eyebrow && <Eyebrow className="mb-5">{panel.eyebrow}</Eyebrow>}
            <h3 className={typeScale.heading}>{panel.title}</h3>
            <p className="mt-5 max-w-[30rem] text-[1.0625rem] leading-[1.45] font-medium text-pretty text-foreground/90 sm:text-lg sm:leading-[1.43]">
              {panel.description}
            </p>
            {panel.icons && panel.iconStyle === "tiles" && (
              <ul className="mt-11 flex items-center justify-center gap-4 mask-x-from-80%">
                {panel.icons.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex size-[4.25rem] items-center justify-center rounded-md bg-muted transition-[translate,background-color] duration-300 hover:-translate-y-1 hover:bg-secondary sm:size-[5.25rem]"
                  >
                    <Icon
                      aria-label={label}
                      className="size-7 text-foreground sm:size-8"
                      strokeWidth={1.75}
                    />
                  </li>
                ))}
              </ul>
            )}
            {panel.link && (
              <TextLink link={panel.link} showPlanned={showPlanned} className="mt-auto pt-12" />
            )}
          </article>
        </Reveal>
      ))}
    </div>
  );
}
