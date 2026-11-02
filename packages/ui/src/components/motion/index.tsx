"use client";

import { motionEase, revealDuration } from "@rektinasub/ui/lib/motion";
import { cn } from "cn";
import { ReactLenis } from "lenis/react";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

/**
 * Motion foundations. One easing curve and one duration family across the site:
 * - `SmoothScroll`: Lenis smooth scrolling for the page (and in-page anchor links).
 * - `Reveal`: fade-and-rise when an element first enters the viewport.
 * - `Parallax`: a small scroll-linked drift for decorative layers and product screens.
 * Everything is skipped when the user prefers reduced motion.
 */

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True when the user asks for reduced motion. Assumes reduced motion during server rendering. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => true,
  );
}

/** Wrap the app once. Lenis drives native scroll, so scroll events and sticky elements keep working. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return children;
  return (
    <ReactLenis
      root
      options={{ lerp: 0.11, wheelMultiplier: 1, anchors: { offset: -96 }, autoRaf: true }}
    >
      {children}
    </ReactLenis>
  );
}

export type RevealProps = {
  children: ReactNode;
  /** Delay in ms, for staggering siblings (e.g. `index * 80`). */
  delay?: number;
  /** Distance travelled in px. */
  distance?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
};

/**
 * Fades and lifts its children the first time they scroll into view. Content renders visible on
 * the server and without JavaScript; only elements below the fold at load are hidden, so nothing
 * already on screen ever flashes. Styles are written to the node directly, so it never re-renders.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 24,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia(reducedMotionQuery).matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    node.style.opacity = "0";
    node.style.transform = `translate3d(0, ${distance}px, 0)`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        node.style.transition = `opacity ${revealDuration}ms ${motionEase} ${delay}ms, transform ${revealDuration}ms ${motionEase} ${delay}ms`;
        node.style.opacity = "1";
        node.style.transform = "none";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, distance]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Moves its children by `speed` × the element's distance from the viewport centre as the page
 * scrolls. Small speeds (±0.04–0.15) read as depth; keep it for decorative layers and screens.
 */
export function Parallax({
  children,
  speed = -0.06,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia(reducedMotionQuery).matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      // Clamp to one viewport so off-screen elements never drift far from their layout position.
      const offset = Math.max(
        -window.innerHeight,
        Math.min(window.innerHeight, rect.top + rect.height / 2 - window.innerHeight / 2),
      );
      node.style.transform = `translate3d(0, ${(offset * speed).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
