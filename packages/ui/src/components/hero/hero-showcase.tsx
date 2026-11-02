"use client";

import { TextLink } from "@rektinasub/ui/components/actions";
import { usePrefersReducedMotion } from "@rektinasub/ui/components/motion";
import { Stage } from "@rektinasub/ui/components/showcase";
import type { LinkItem } from "@rektinasub/ui/lib/links";
import { cn } from "cn";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type HeroSlide = {
  /** Shown after "Now showing", e.g. "Order receipt". */
  name: string;
  /** Muted detail after the name, e.g. "Airtime & data". */
  detail?: string;
  visual: ReactNode;
};

export type HeroShowcaseProps = {
  slides: HeroSlide[];
  label?: string;
  link?: LinkItem;
  /** Milliseconds per slide. */
  interval?: number;
  showPlanned?: boolean;
};

/**
 * The hero's "now showing" card: a light stage that cycles through product screens, a caption,
 * segmented progress and a text link. The active segment fills over `interval`, then the next
 * slide shows. Auto-advance stops when the user prefers reduced motion; segments stay clickable.
 */
export function HeroShowcase({
  slides,
  label = "Now showing",
  link,
  interval = 6000,
  showPlanned,
}: HeroShowcaseProps) {
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  const fills = useRef<(HTMLSpanElement | null)[]>([]);

  // Fill the active segment with the Web Animations API, then advance when it finishes.
  useEffect(() => {
    const fill = fills.current[active];
    if (reduced || !fill) return;
    const animation = fill.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: interval,
      easing: "linear",
      fill: "forwards",
    });
    animation.onfinish = () => setActive((index) => (index + 1) % slides.length);
    return () => animation.cancel();
  }, [active, interval, reduced, slides.length]);

  const slide = slides[active];
  if (!slide) return null;

  return (
    <div className="flex flex-col">
      <Stage className="aspect-[16/9]">
        {slides.map((item, index) => (
          <div
            key={item.name}
            aria-hidden={index !== active}
            className={cn(
              "absolute inset-0 transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              index === active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
          >
            {item.visual}
          </div>
        ))}
      </Stage>
      <p
        className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base leading-6"
        aria-live="polite"
      >
        <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </span>
        <span
          key={slide.name}
          className="animate-in font-semibold duration-500 fade-in-0 motion-reduce:animate-none"
        >
          {slide.name}
        </span>
        {slide.detail && <span className="text-foreground/70">{slide.detail}</span>}
      </p>
      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="flex gap-1">
          {slides.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${item.name}`}
              aria-current={index === active}
              className="group/segment relative h-5 w-8 cursor-pointer"
            >
              <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-foreground/25 transition-colors group-hover/segment:bg-foreground/50" />
              <span
                ref={(node) => {
                  fills.current[index] = node;
                }}
                className={cn(
                  "absolute inset-x-0 top-1/2 h-0.5 origin-left -translate-y-1/2 bg-foreground",
                  index < active || (reduced && index === active) ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          ))}
        </div>
        {link && <TextLink link={link} showPlanned={showPlanned} />}
      </div>
    </div>
  );
}
