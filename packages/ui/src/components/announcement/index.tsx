"use client";

import { SmartLink } from "@rektinasub/ui/components/adapters";
import { isPlanned, type LinkItem } from "@rektinasub/ui/lib/links";
import { ArrowRightIcon, XIcon } from "lucide-react";
import { useState } from "react";

export type AnnouncementBarProps = {
  message: string;
  /** Short uppercase chip before the message, e.g. "New". */
  badge?: string;
  /** When live, the whole message becomes the link. */
  link?: LinkItem;
  showPlanned?: boolean;
};

/**
 * 32px strip above the header: white chip, 14px message, trailing arrow. Dismissal lasts for the
 * page view.
 */
export function AnnouncementBar({
  message,
  badge,
  link,
  showPlanned = false,
}: AnnouncementBarProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const href = link && (showPlanned || !isPlanned(link)) ? link.href : undefined;

  const content = (
    <>
      {badge && (
        <span className="flex h-[1.125rem] items-center bg-foreground px-1.5 text-[0.6875rem] font-medium tracking-[0.06em] text-background uppercase">
          {badge}
        </span>
      )}
      <span className="truncate">{message}</span>
      {href && (
        <ArrowRightIcon
          aria-hidden
          className="size-4 shrink-0 transition-transform group-hover/announce:translate-x-0.5"
        />
      )}
    </>
  );

  return (
    <div className="relative border-b bg-card text-foreground/85">
      <div className="mx-auto flex h-8 max-w-[1450px] items-center justify-center px-12 text-sm">
        {href ? (
          <SmartLink
            href={href}
            external={link?.external}
            className="group/announce flex min-w-0 items-center gap-3 hover:text-foreground"
          >
            {content}
          </SmartLink>
        ) : (
          <p className="flex min-w-0 items-center gap-3">{content}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss announcement"
        className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}
