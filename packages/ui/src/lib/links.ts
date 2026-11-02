/**
 * Shared link model used by every content-driven system (navigation, footer, ...).
 * Apps describe links as data; systems decide how to render them.
 */

/** `planned` marks a destination that does not exist yet. Systems hide it unless `showPlanned` is set. */
export type LinkStatus = "live" | "planned";

export type LinkItem = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  status?: LinkStatus;
};

/**
 * A link rendered as a button (header actions, hero CTAs, CTA bands).
 * `trailing: "arrow"` adds a right arrow.
 */
export type ActionLink = LinkItem & {
  variant?: "default" | "contrast" | "outline" | "ghost";
  trailing?: "arrow";
};

export function isPlanned(link: Pick<LinkItem, "status">) {
  return link.status === "planned";
}

/** Drops planned links unless the caller opts in (for example, in development). */
export function visibleLinks<T extends Pick<LinkItem, "status">>(
  links: readonly T[],
  showPlanned = false,
): T[] {
  return showPlanned ? [...links] : links.filter((link) => !isPlanned(link));
}

/** Exact match for the root, prefix match for sections (`/developers` is active on `/developers/email`). */
export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const path = href.split(/[?#]/)[0] ?? href;
  return pathname === path || pathname.startsWith(`${path}/`);
}
