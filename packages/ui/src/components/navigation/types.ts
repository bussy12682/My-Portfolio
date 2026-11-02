import type { LucideIcon } from "lucide-react";
import type { ActionLink, LinkItem } from "@rektinasub/ui/lib/links";

/** A destination inside a menu. `icon` is optional decoration; `description` shows in panels, not the top bar. */
export type NavLink = LinkItem & { icon?: LucideIcon };

/** Top-level entry that navigates directly. */
export type NavLinkItem = NavLink & { type: "link" };

/** Top-level entry that opens a simple list of links. */
export type NavGroupItem = { type: "group"; label: string; items: NavLink[] };

/** A titled column inside a mega menu. */
export type NavMegaSection = { title: string; items: NavLink[] };

/** Optional promotional card on the right of a mega menu. */
export type NavFeatured = LinkItem & {
  eyebrow?: string;
  image: { src: string; alt: string };
};

/** Top-level entry that opens a multi-column panel. */
export type NavMegaItem = {
  type: "mega";
  label: string;
  sections: NavMegaSection[];
  featured?: NavFeatured;
};

/** Add a new menu shape by adding a member here and a renderer in navigation-desktop/mobile. */
export type NavItem = NavLinkItem | NavGroupItem | NavMegaItem;

export type NavAction = ActionLink;

export type NavigationConfig = {
  items: NavItem[];
  actions?: NavAction[];
};
