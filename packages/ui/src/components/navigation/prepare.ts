import { isPlanned, visibleLinks } from "@rektinasub/ui/lib/links";
import type { NavItem, NavigationConfig } from "./types";

/** Applies link availability to the whole tree and drops menus left empty. */
export function prepareNavigation(
  config: NavigationConfig,
  showPlanned: boolean,
): Required<NavigationConfig> {
  const items = config.items.flatMap<NavItem>((item) => {
    if (item.type === "link") return showPlanned || !isPlanned(item) ? [item] : [];
    if (item.type === "group") {
      const links = visibleLinks(item.items, showPlanned);
      return links.length ? [{ ...item, items: links }] : [];
    }
    const sections = item.sections
      .map((section) => ({ ...section, items: visibleLinks(section.items, showPlanned) }))
      .filter((section) => section.items.length);
    if (!sections.length) return [];
    const featured =
      item.featured && (showPlanned || !isPlanned(item.featured)) ? item.featured : undefined;
    return [{ ...item, sections, featured }];
  });
  return { items, actions: visibleLinks(config.actions ?? [], showPlanned) };
}
