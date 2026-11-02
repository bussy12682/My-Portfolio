import type { ActionLink, LinkItem } from "@rektinasub/ui/lib/links";

/**
 * Shared destinations, so every page points at the same routes with the same labels.
 * A link is `planned` until its page exists; planned links are hidden in production.
 */
export const routes = {
  signUp: { label: "Get Started", href: "/sign-up" },
  signIn: { label: "Log In", href: "/sign-in" },
  airtime: { label: "Buy airtime", href: "/airtime" },
  data: { label: "Browse data bundles", href: "/data" },
  developers: { label: "For developers", href: "/developers" },
  emailApi: { label: "Explore the Email API", href: "/developers/email-api" },
  pricing: { label: "See pricing", href: "/pricing" },
  about: { label: "About us", href: "/about" },
  docs: { label: "Read the docs", href: "/docs", status: "planned" },
  status: { label: "Service status", href: "/status", status: "planned" },
  contact: { label: "Contact us", href: "/contact", status: "planned" },
} satisfies Record<string, LinkItem>;

export const getStarted: ActionLink = routes.signUp;
export const forDevelopers: ActionLink = { ...routes.developers, variant: "contrast" };
