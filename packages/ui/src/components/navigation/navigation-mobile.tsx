"use client";

import { SmartLink } from "@rektinasub/ui/components/adapters";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@rektinasub/ui/components/ui/accordion";
import { Actions } from "@rektinasub/ui/components/actions";
import { Button } from "@rektinasub/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@rektinasub/ui/components/ui/sheet";
import { cn } from "cn";
import { MenuIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLinkContent } from "./navigation-link";
import type { NavAction, NavItem, NavLink } from "./types";

type NavigationMobileProps = {
  items: NavItem[];
  actions: NavAction[];
  brand: ReactNode;
  /** Applied to the drawer, which renders in a portal outside the header. */
  surfaceClassName?: string;
};

export function NavigationMobile({
  items,
  actions,
  brand,
  surfaceClassName,
}: NavigationMobileProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right" className={cn("w-full gap-0 sm:max-w-sm", surfaceClassName)}>
        <SheetHeader className="border-b">
          <SheetTitle render={<div />}>{brand}</SheetTitle>
        </SheetHeader>
        <nav aria-label="Main" className="flex-1 overflow-y-auto px-4 py-2">
          <Accordion>
            {items.map((item) =>
              item.type === "link" ? (
                <SmartLink
                  key={item.label}
                  href={item.href}
                  external={item.external}
                  onClick={close}
                  className="flex items-center gap-2 border-b py-3 text-sm font-medium"
                >
                  {item.label}
                </SmartLink>
              ) : (
                <AccordionItem key={item.label} value={item.label}>
                  <AccordionTrigger>{item.label}</AccordionTrigger>
                  <AccordionContent>
                    {item.type === "group" ? (
                      <MobileLinkList links={item.items} onNavigate={close} />
                    ) : (
                      item.sections.map((section) => (
                        <div key={section.title} className="pb-2">
                          <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {section.title}
                          </p>
                          <MobileLinkList links={section.items} onNavigate={close} />
                        </div>
                      ))
                    )}
                  </AccordionContent>
                </AccordionItem>
              ),
            )}
          </Accordion>
        </nav>
        {actions.length > 0 && (
          <SheetFooter className="border-t">
            {/* Already filtered by prepareNavigation, so nothing left here needs hiding. */}
            <Actions
              actions={actions}
              size="lg"
              showPlanned
              onNavigate={close}
              className="flex-col items-stretch"
            />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MobileLinkList({ links, onNavigate }: { links: NavLink[]; onNavigate: () => void }) {
  return (
    <ul className="grid gap-0.5">
      {links.map((link) => (
        <li key={link.href}>
          <SmartLink
            href={link.href}
            external={link.external}
            onClick={onNavigate}
            className="group/nav-link flex items-start gap-3 rounded-md p-2 text-sm hover:bg-muted"
          >
            <NavLinkContent item={link} />
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
