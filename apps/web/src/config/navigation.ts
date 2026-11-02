import type { NavigationConfig } from "@rektinasub/ui/components/navigation";
import {
  ActivityIcon,
  BookOpenIcon,
  Building2Icon,
  CircleHelpIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  MailIcon,
  PhoneIcon,
  SmartphoneIcon,
  WifiIcon,
} from "lucide-react";
import { media } from "./media";

// Flip a link's status to "live" (or delete the field) when its page ships.
export const navigationConfig: NavigationConfig = {
  items: [
    {
      type: "group",
      label: "Personal",
      items: [
        {
          label: "Airtime",
          href: "/airtime",
          icon: SmartphoneIcon,
          description: "Top up any line with the final price shown first.",
        },
        {
          label: "Data",
          href: "/data",
          icon: WifiIcon,
          description: "Compare bundles by size, validity and price.",
        },
      ],
    },
    {
      type: "mega",
      label: "Developers",
      sections: [
        {
          title: "Products",
          items: [
            {
              label: "Email API",
              href: "/developers/email-api",
              icon: MailIcon,
              description: "Transactional email with delivery logs and signed webhooks.",
            },
            {
              label: "Usage & keys",
              href: "/developers/usage",
              icon: GaugeIcon,
              status: "planned",
              description: "Usage per workspace and key, spending caps, rotation.",
            },
          ],
        },
        {
          title: "Resources",
          items: [
            {
              label: "Developer Platform",
              href: "/developers",
              icon: LayoutDashboardIcon,
              description: "API keys, sender domains, usage and billing.",
            },
            {
              label: "API Documentation",
              href: "/docs",
              icon: BookOpenIcon,
              status: "planned",
              description: "Authentication, endpoints, errors and limits.",
            },
            {
              label: "Service Status",
              href: "/status",
              icon: ActivityIcon,
              status: "planned",
              description: "Current availability of every service.",
            },
          ],
        },
      ],
      featured: {
        eyebrow: "Permitt by REKTINA",
        label: "Email API for your product",
        description: "Send receipts, alerts and one-time codes through one documented endpoint.",
        href: "/developers/email-api",
        image: media.developerWorkspace,
      },
    },
    { type: "link", label: "Pricing", href: "/pricing" },
    {
      type: "group",
      label: "Company",
      items: [
        { label: "About Us", href: "/about", icon: Building2Icon },
        { label: "Contact Us", href: "/contact", icon: PhoneIcon, status: "planned" },
        { label: "FAQs", href: "/#faq", icon: CircleHelpIcon },
      ],
    },
  ],
  actions: [
    { label: "Log In", href: "/sign-in", variant: "ghost" },
    { label: "Get Started", href: "/sign-up", variant: "default" },
  ],
};
