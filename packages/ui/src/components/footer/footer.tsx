"use client";

import { SmartLink } from "@rektinasub/ui/components/adapters";
import { Container } from "@rektinasub/ui/components/layout";
import { typeScale } from "@rektinasub/ui/components/typography";
import { isPlanned, visibleLinks } from "@rektinasub/ui/lib/links";
import { cn } from "cn";
import type { ReactNode } from "react";
import type { FooterConfig, FooterGroup } from "./types";

export type FooterProps = {
  config: FooterConfig;
  brand: ReactNode;
  showPlanned?: boolean;
  className?: string;
};

const labelClasses =
  "text-xs leading-4 font-medium tracking-[0.08em] text-muted-foreground uppercase";

/**
 * Measured from the design reference: brand and a 20px tagline, a hairline, then a 32px statement
 * with labelled contact links on the left half and link columns (12px uppercase heads, 15px links
 * on a 32px pitch) on the right half. A bottom bar carries the copyright and legal links in 12px
 * uppercase.
 */
export function Footer({ config, brand, showPlanned = false, className }: FooterProps) {
  const groups = prepareGroups(config.groups, showPlanned);
  const secondaryLinks = prepareGroups(config.secondaryGroups ?? [], showPlanned).flatMap(
    (group) => group.links,
  );
  const contacts = (config.contacts ?? []).filter(
    (contact) => showPlanned || !isPlanned(contact.link),
  );

  return (
    <footer className={cn("bg-background text-foreground", className)}>
      <Container className="pt-12 sm:pt-14">
        <div className="flex flex-col gap-5 border-b pb-11">
          <div>{brand}</div>
          {config.tagline && (
            <p className="text-lg leading-6 font-medium sm:text-xl">{config.tagline}</p>
          )}
        </div>

        <div className="grid gap-14 pt-12 pb-16 lg:grid-cols-2 lg:gap-0 lg:pt-[3.25rem]">
          <div className="flex flex-col lg:pr-24">
            {config.statement && (
              <p className={cn(typeScale.heading, "max-w-[22ch] whitespace-pre-line")}>
                {config.statement}
              </p>
            )}
            {contacts.length > 0 && (
              <dl className="mt-11 flex flex-wrap gap-x-20 gap-y-8 border-b pb-11 lg:mt-12">
                {contacts.map((contact) => (
                  <div key={contact.label} className="flex flex-col gap-3.5">
                    <dt className={labelClasses}>{contact.label}</dt>
                    <dd>
                      <SmartLink
                        href={contact.link.href}
                        external={contact.link.external}
                        className="text-[1.0625rem] font-medium underline decoration-1 underline-offset-[5px] hover:decoration-orbital"
                      >
                        {contact.link.label}
                      </SmartLink>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
            {groups.map((group) => (
              <nav key={group.title} aria-label={group.title} className="flex flex-col">
                <p className={labelClasses}>{group.title}</p>
                <ul className="mt-5 flex flex-col">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <SmartLink
                        href={link.href}
                        external={link.external}
                        className="inline-block py-1 text-[0.9375rem] leading-6 font-medium text-foreground/90 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t">
        <Container className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:gap-10">
          <p className={cn(labelClasses, "text-foreground/80")}>{config.copyright}</p>
          {secondaryLinks.length > 0 && (
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-8 gap-y-2">
                {secondaryLinks.map((link) => (
                  <li key={link.href}>
                    <SmartLink
                      href={link.href}
                      external={link.external}
                      className={cn(labelClasses, "text-foreground/80 hover:text-foreground")}
                    >
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </Container>
      </div>
    </footer>
  );
}

function prepareGroups(groups: FooterGroup[], showPlanned: boolean) {
  return groups
    .map((group) => ({ ...group, links: visibleLinks(group.links, showPlanned) }))
    .filter((group) => group.links.length);
}
