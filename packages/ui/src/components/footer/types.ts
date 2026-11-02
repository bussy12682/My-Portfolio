import type { LinkItem } from "@rektinasub/ui/lib/links";

export type FooterGroup = { title: string; links: LinkItem[] };

/** A labelled link under the statement, e.g. "Get started → Create an account". */
export type FooterContact = { label: string; link: LinkItem };

export type FooterConfig = {
  /** Link columns on the right half, three per row on wide screens, in order. */
  groups: FooterGroup[];
  /** Links in the bottom bar, such as Legal. Rendered inline. */
  secondaryGroups?: FooterGroup[];
  /** Short line under the brand mark. */
  tagline?: string;
  /** 32px statement on the left half. */
  statement?: string;
  contacts?: FooterContact[];
  copyright: string;
};
