import type { FooterConfig } from "@rektinasub/ui/components/footer";
import { siteConfig } from "./site";

// Flip a link's `status` when its page ships. Planned links and contacts are hidden in production.
export const footerConfig: FooterConfig = {
  tagline: siteConfig.tagline,
  statement: "Everyday top-ups and production email, from one account.",
  contacts: [
    { label: "Get started", link: { label: "Create an account", href: "/sign-up" } },
    { label: "Developers", link: { label: "Read the docs", href: "/docs", status: "planned" } },
  ],
  groups: [
    {
      title: "Personal",
      links: [
        { label: "Airtime", href: "/airtime" },
        { label: "Data bundles", href: "/data" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      title: "Developers",
      links: [
        { label: "Email API", href: "/developers/email-api" },
        { label: "Developer platform", href: "/developers" },
        { label: "API documentation", href: "/docs", status: "planned" },
        { label: "Service status", href: "/status", status: "planned" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About us", href: "/about" },
        { label: "Contact us", href: "/contact", status: "planned" },
        { label: "FAQs", href: "/#faq" },
      ],
    },
  ],
  secondaryGroups: [
    {
      title: "Legal",
      links: [
        { label: "Terms", href: "/legal/terms", status: "planned" },
        { label: "Privacy", href: "/legal/privacy", status: "planned" },
        { label: "Acceptable use", href: "/legal/acceptable-use", status: "planned" },
      ],
    },
  ],
  copyright: "© 2026 REKTINA.sub. All rights reserved.",
};
