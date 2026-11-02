"use client";

import { Actions } from "@rektinasub/ui/components/actions";
import { cn } from "cn";
import type { ReactNode } from "react";
import { NavigationDesktop } from "./navigation-desktop";
import { NavigationMobile } from "./navigation-mobile";
import { prepareNavigation } from "./prepare";
import type { NavigationConfig } from "./types";

export type NavigationHeaderProps = {
  config: NavigationConfig;
  /** Brand mark, linked to home by the app. The system stays brand-agnostic. */
  brand: ReactNode;
  /** Show links marked `planned`. Keep false in production. */
  showPlanned?: boolean;
  className?: string;
};

/**
 * A 75px bar on the page canvas with a hairline underneath: brand left, menu centred, actions
 * right (design reference). Sticky.
 */
export function NavigationHeader({
  config,
  brand,
  showPlanned = false,
  className,
}: NavigationHeaderProps) {
  const { items, actions } = prepareNavigation(config, showPlanned);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 text-foreground backdrop-blur-sm",
        className,
      )}
    >
      <div className="mx-auto grid h-16 w-full max-w-[1450px] grid-cols-[1fr_auto] items-center gap-8 px-5 sm:px-8 lg:h-[4.6875rem] lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        <div className="justify-self-start">{brand}</div>
        <div className="hidden lg:block">
          <NavigationDesktop items={items} />
        </div>
        <Actions
          actions={actions}
          showPlanned={showPlanned}
          className="hidden justify-self-end lg:flex"
        />
        <div className="justify-self-end lg:hidden">
          <NavigationMobile
            items={items}
            actions={actions}
            brand={brand}
            surfaceClassName="bg-background text-foreground"
          />
        </div>
      </div>
    </header>
  );
}
