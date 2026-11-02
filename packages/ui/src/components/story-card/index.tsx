import { TextLink } from "@rektinasub/ui/components/actions";
import { Reveal } from "@rektinasub/ui/components/motion";
import { Stage } from "@rektinasub/ui/components/showcase";
import { typeScale } from "@rektinasub/ui/components/typography";
import type { LinkItem } from "@rektinasub/ui/lib/links";
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type StoryTag = { label: string; tone?: "accent" | "neutral" };

export type StoryNote = {
  text: string;
  /** Bold line under the note, e.g. the rule it describes. */
  title: string;
  /** Muted line beside the title. */
  detail?: string;
  icon?: LucideIcon;
};

export type StoryCardProps = {
  /** Bold name before the tags, e.g. the product. */
  name: string;
  tags?: StoryTag[];
  /** Right-aligned uppercase meta, e.g. "Example order". */
  meta?: string;
  title: string;
  description: string;
  link?: LinkItem;
  note?: StoryNote;
  /** Product screen on a light stage. */
  visual: ReactNode;
  /** Puts the visual on the left. */
  reverse?: boolean;
  showPlanned?: boolean;
};

/**
 * A bordered split card (design reference, case studies): 32px padding, a 46/54 split, square
 * chips, a 20px title, 16px muted copy, a text link and an inset note on #151515.
 */
export function StoryCard({
  name,
  tags = [],
  meta,
  title,
  description,
  link,
  note,
  visual,
  reverse = false,
  showPlanned = false,
}: StoryCardProps) {
  const Icon = note?.icon;

  return (
    <Reveal
      as="article"
      className="group/story grid border lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)]"
    >
      <div className={cn("flex flex-col p-6 sm:p-8", reverse && "lg:order-2")}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="mr-2 text-base font-semibold tracking-[-0.01em]">{name}</span>
          {tags.map((tag) => (
            <span
              key={tag.label}
              className={cn(
                "flex h-[1.625rem] items-center rounded-sm px-2.5 text-[0.9375rem]",
                tag.tone === "accent"
                  ? "bg-orbital/15 text-orbital"
                  : "bg-secondary text-foreground/75",
              )}
            >
              {tag.label}
            </span>
          ))}
          {meta && (
            <span className="ml-auto text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
              {meta}
            </span>
          )}
        </div>
        <h3
          className={cn(
            typeScale.subtitle,
            "mt-7 max-w-[30rem] sm:text-[1.375rem] sm:leading-[1.2] sm:tracking-[-0.02em]",
          )}
        >
          {title}
        </h3>
        <p className={cn(typeScale.body, "mt-5 max-w-[30rem]")}>{description}</p>
        {link && <TextLink link={link} showPlanned={showPlanned} className="mt-9" />}
        {note && (
          <figure className="mt-10 bg-card px-5 py-6 lg:mt-auto">
            <blockquote className="text-[0.9375rem] leading-[1.47] text-foreground/90">
              {note.text}
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              {Icon && (
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon aria-hidden className="size-5 text-orbital" strokeWidth={1.75} />
                </span>
              )}
              <span className="flex flex-col">
                <span className="text-base leading-6 font-semibold">{note.title}</span>
                {note.detail && (
                  <span className="text-base leading-6 text-muted-foreground">{note.detail}</span>
                )}
              </span>
            </figcaption>
          </figure>
        )}
      </div>
      {/* The divider lives on the wrapper: the stage itself carries the light token set. */}
      <div
        className={cn("border-t lg:border-t-0", reverse ? "lg:order-1 lg:border-r" : "lg:border-l")}
      >
        <Stage className="h-full min-h-[22rem] lg:min-h-[30.6875rem]">
          <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/story:scale-[1.02]">
            {visual}
          </div>
        </Stage>
      </div>
    </Reveal>
  );
}
