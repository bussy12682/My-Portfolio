"use client";

import { SmartImage, SmartLink, useAdapters } from "@rektinasub/ui/components/adapters";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@rektinasub/ui/components/ui/navigation-menu";
import { isActivePath } from "@rektinasub/ui/lib/links";
import { cn } from "cn";
import { NavPanelLink } from "./navigation-link";
import type { NavFeatured, NavGroupItem, NavItem, NavMegaItem } from "./types";

/** Top-level entries: 16px regular text on a transparent bar, as in the design reference. */
// 15px medium labels with 18px between items, measured from the design reference.
const topLevelClasses =
  "h-10 gap-1 rounded-md bg-transparent px-[0.5625rem] text-[0.9375rem] font-medium tracking-[-0.005em] text-foreground/90 hover:bg-transparent hover:text-foreground data-popup-open:bg-transparent data-popup-open:text-foreground";

export function NavigationDesktop({ items }: { items: NavItem[] }) {
  const { pathname } = useAdapters();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.map((item) => (
          <NavigationMenuItem key={item.label}>
            {item.type === "link" ? (
              <NavigationMenuLink
                active={isActivePath(pathname, item.href)}
                render={<SmartLink href={item.href} external={item.external} />}
                className={cn(navigationMenuTriggerStyle(), topLevelClasses)}
              >
                {item.label}
              </NavigationMenuLink>
            ) : (
              <>
                <NavigationMenuTrigger className={topLevelClasses}>
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  {item.type === "group" ? <GroupPanel item={item} /> : <MegaPanel item={item} />}
                </NavigationMenuContent>
              </>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function GroupPanel({ item }: { item: NavGroupItem }) {
  const { pathname } = useAdapters();
  return (
    <ul className="grid w-80 gap-0.5 p-1">
      {item.items.map((link) => (
        <li key={link.href}>
          <NavPanelLink item={link} active={isActivePath(pathname, link.href)} />
        </li>
      ))}
    </ul>
  );
}

function MegaPanel({ item }: { item: NavMegaItem }) {
  const { pathname } = useAdapters();
  return (
    <div className="flex w-[min(56rem,calc(100vw-4rem))] gap-2 p-2">
      <div className="grid flex-1 auto-cols-fr grid-flow-col gap-4">
        {item.sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <p className="px-2.5 pt-1 pb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {section.title}
            </p>
            <ul className="grid gap-0.5">
              {section.items.map((link) => (
                <li key={link.href}>
                  <NavPanelLink item={link} active={isActivePath(pathname, link.href)} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {item.featured && <FeaturedCard featured={item.featured} />}
    </div>
  );
}

function FeaturedCard({ featured }: { featured: NavFeatured }) {
  return (
    <NavigationMenuLink
      render={<SmartLink href={featured.href} external={featured.external} />}
      className="dark relative isolate flex w-64 shrink-0 flex-col items-start justify-end gap-1 overflow-hidden rounded-md bg-background p-4 text-foreground hover:bg-background focus:bg-background"
    >
      <SmartImage
        fill
        src={featured.image.src}
        alt={featured.image.alt}
        sizes="16rem"
        className="-z-10 object-cover opacity-60"
      />
      <span className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/60 to-transparent" />
      {featured.eyebrow && (
        <span className="text-[11px] font-medium tracking-wide text-orbital uppercase">
          {featured.eyebrow}
        </span>
      )}
      <span className="flex items-center gap-2 font-medium">{featured.label}</span>
      {featured.description && (
        <span className="text-xs leading-snug text-muted-foreground">{featured.description}</span>
      )}
    </NavigationMenuLink>
  );
}
