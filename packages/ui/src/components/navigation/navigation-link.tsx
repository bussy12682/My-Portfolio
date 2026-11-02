"use client";

import { SmartLink } from "@rektinasub/ui/components/adapters";
import { NavigationMenuLink } from "@rektinasub/ui/components/ui/navigation-menu";
import { cn } from "cn";
import type { NavLink } from "./types";

/** Icon + label + description. Shared by desktop panels and the mobile drawer so both read the same. */
export function NavLinkContent({ item }: { item: NavLink }) {
  const Icon = item.icon;
  return (
    <>
      {Icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground group-hover/nav-link:text-orbital">
          <Icon className="size-4" />
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-[0.9375rem] text-foreground">
          {item.label}
        </span>
        {item.description && (
          <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {item.description}
          </span>
        )}
      </span>
    </>
  );
}

/** A rich link inside a desktop dropdown or mega panel. */
export function NavPanelLink({
  item,
  active,
  className,
}: {
  item: NavLink;
  active?: boolean;
  className?: string;
}) {
  return (
    <NavigationMenuLink
      active={active}
      render={<SmartLink href={item.href} external={item.external} />}
      className={cn("group/nav-link items-start gap-3 p-2.5", className)}
    >
      <NavLinkContent item={item} />
    </NavigationMenuLink>
  );
}
