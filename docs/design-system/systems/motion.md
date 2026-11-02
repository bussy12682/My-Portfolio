# Motion

**Entry:** `@rektinasub/ui/components/motion` (client), with `@rektinasub/ui/lib/motion` for server-safe helpers.

Motion is part of the system, not decoration added page by page. There's one easing (`cubic-bezier(0.22, 1, 0.36, 1)`, a soft ease-out) and one duration family: 800ms for reveals, 300–700ms for hovers. Everything respects `prefers-reduced-motion`.

| Layer         | What                                                                                                                 | Where it's used                                                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Smooth scroll | `SmoothScroll` wraps the app in Lenis (`lerp` 0.11; in-page anchors are offset by the sticky header)                 | `apps/web/src/app/layout.tsx`                                                                                                                                                                                             |
| Entrance      | `enter(step)` returns CSS animation classes (fade and rise, 80ms stagger) and runs once on load. It's server-safe.   | Hero eyebrow, headline, lead, actions, stats and aside                                                                                                                                                                    |
| Viewport      | `Reveal` fades and lifts 24px the first time an element enters the viewport, with an optional `delay` for staggering | `SectionHeader`, `ServiceList` rows, `FeaturePanels`, `StoryCard`, `StepList`, `Faq`, `PlanCards`, `CtaBand`                                                                                                              |
| Scroll-linked | `Parallax` moves its child by `speed` × its distance from the viewport centre, clamped to one viewport               | Product screens (`StageScreen`, −0.03) and the closing glow (0.12)                                                                                                                                                        |
| Micro         | Hover and press states in the systems                                                                                | Button and text-link arrows nudge 2px; service titles shift 6px; cells brighten and their icon turns blue; tool tiles lift 4px; story screens zoom 2%; buttons press 1px; the +/− mark morphs; showcase slides cross-fade |

## Rules

- **Never hide content that's already visible.** `Reveal` renders visible on the server and only hides elements that start below the fold, so there's no flash and nothing is lost without JavaScript.
- **Animate transform and opacity only.** `Reveal` and `Parallax` write styles directly to the node and never re-render React.
- **Keep scroll-linked speeds small** (±0.03–0.15). Use them for depth, not spectacle.
- **Add motion inside systems**, so every page gets the same behaviour.
