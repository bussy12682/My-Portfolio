import { cn } from "cn";

/** The site's easing (a soft ease-out) and reveal duration. Reuse them for custom transitions. */
export const motionEase = "cubic-bezier(0.22, 1, 0.36, 1)";
export const revealDuration = 800;

const enterDelays = [
  "[animation-delay:40ms]",
  "[animation-delay:120ms]",
  "[animation-delay:200ms]",
  "[animation-delay:280ms]",
  "[animation-delay:360ms]",
  "[animation-delay:440ms]",
] as const;

/**
 * Entrance classes for above-the-fold content (heroes), run once on load with CSS only, so they
 * work in server components. Pass the step index to stagger: `enter(0)`, `enter(1)`, ...
 */
export function enter(step: number) {
  return cn(
    "animate-in duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] fade-in-0 fill-mode-both slide-in-from-bottom-4 motion-reduce:animate-none",
    enterDelays[Math.min(step, enterDelays.length - 1)],
  );
}
