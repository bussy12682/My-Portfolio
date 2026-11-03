import type { AuthFormProps } from "@rektinasub/ui/components/auth-form";
import type { FaqItem } from "@rektinasub/ui/components/faq";
import type { FeaturePanel } from "@rektinasub/ui/components/feature-panels";
import type { PlanCard } from "@rektinasub/ui/components/plan-cards";
import type { StepItem } from "@rektinasub/ui/components/step-list";
import type { ActionLink } from "@rektinasub/ui/lib/links";
import { getStarted, routes } from "@/config/links";
import { homeContent } from "@/config/home";

// Pricing, About and the auth pages. Prices aren't set yet (the PRD sets them after provider
// selection), so Pricing describes the model and says plainly when numbers will be published.

export const pricingPage = {
  meta: {
    title: "Pricing",
    description: "How pricing works for top-ups and for the Permitt email API.",
  },
  hero: {
    eyebrow: "Pricing",
    title: "Prices you can read before you pay.",
    description:
      "Every top-up shows its final total before you confirm. Developer pricing for Permitt is published before the developer beta opens.",
    actions: [getStarted] satisfies ActionLink[],
  },
  plans: [
    {
      eyebrow: "REKTINA.sub",
      name: "Personal",
      description: "Airtime and data for your own lines and anyone else's.",
      price: "Listed price",
      priceNote: "Per top-up, shown in full before you pay. No subscription.",
      points: [
        "The confirmed total is the amount charged",
        "One charge per order, even if you retry",
        "Receipt and history for every order",
        "Refund or credit if a top-up fails",
      ],
      action: { ...routes.airtime, label: "Buy airtime" },
      featured: true,
    },
    {
      eyebrow: "Permitt by REKTINA",
      name: "Developers",
      description: "Transactional email for the product you're building.",
      price: "Usage-based",
      priceNote: "Rates are published before the developer beta opens.",
      points: [
        "Pay for what you send, tracked per key",
        "Spending caps you set per workspace",
        "Usage visible per workspace and key",
        "Rates published here before anything is billed",
      ],
      action: { ...routes.developers, label: "Explore Permitt" },
    },
  ] satisfies PlanCard[],
  faq: {
    eyebrow: "FAQ",
    title: "Pricing,\nanswered plainly.",
    items: [
      {
        question: "Is anything added at checkout?",
        answer: "No. The total on the confirmation screen is the amount you pay for that order.",
      },
      {
        question: "Do I need a subscription?",
        answer: "No. Personal top-ups are paid per order. There's nothing to subscribe to.",
      },
      {
        question: "When will developer pricing be published?",
        answer: "Before the developer beta opens, on this page, with the units it's measured in.",
      },
      {
        question: "Can a bug run up my developer bill?",
        answer:
          "Not past your cap. Set a spending cap per workspace and sends stop when it's reached.",
      },
    ] satisfies FaqItem[],
  },
  closing: {
    eyebrow: "Ready when you are",
    title: "See the price,\nthen decide.",
    description: "Create an account and check the total for any top-up before you pay a thing.",
    actions: [getStarted] satisfies ActionLink[],
  },
};

export const aboutPage = {
  meta: {
    title: "About",
    description:
      "REKTINA builds everyday top-ups and developer email that are traceable from start to finish.",
  },
  hero: {
    eyebrow: "About REKTINA",
    title: "Everyday connectivity, built to be traceable.",
    description:
      "REKTINA.sub is for people topping up their lines. Permitt is for developers sending email from their products. Both are built on the same idea: every transaction should end in a clear answer.",
    actions: [getStarted, { ...routes.developers, variant: "contrast" }] satisfies ActionLink[],
  },
  principles: {
    eyebrow: "What we hold ourselves to",
    title: "Five rules\nwe build by.",
    items: [
      {
        title: "Show the price first",
        description:
          "The amount you confirm is the amount you pay. Nothing is added after the confirmation screen.",
      },
      {
        title: "One order, one charge",
        description:
          "Every order and request carries a unique ID, so retries never become duplicate charges or duplicate sends.",
      },
      {
        title: "Every order ends in an answer",
        description:
          "Delivered, failed or refunded. Nothing stays pending forever, and the reason is always on record.",
      },
      {
        title: "Promise only what we control",
        description:
          "We report what providers tell us. We don't promise inbox placement or claim to be the cheapest.",
      },
      {
        title: "Ship carefully",
        description:
          "Email comes first. SMS follows only once email is stable and its abuse controls are proven.",
      },
    ] satisfies StepItem[],
  },
  panels: homeContent.panels satisfies [FeaturePanel, FeaturePanel],
  closing: {
    eyebrow: "Ready when you are",
    title: "Start with\nwhat you need.",
    description:
      "Top up a line today. Add a developer workspace whenever your product is ready to send.",
    actions: [getStarted] satisfies ActionLink[],
  },
};

export const signInPage = {
  meta: { title: "Log in", description: "Log in to REKTINA.sub." },
  form: {
    title: "Log in",
    description: "Top-ups, receipts and developer workspaces, in one account.",
    fields: [
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "you@example.com",
        autoComplete: "email",
      },
      { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
    ],
    submitLabel: "Log in",
    apiEndpoint: "/api/auth/sign-in",
    switchPrompt: {
      text: "New to REKTINA?",
      link: { label: "Create an account", href: "/sign-up" },
    },
  } satisfies AuthFormProps,
};

export const signUpPage = {
  meta: { title: "Create an account", description: "Create a REKTINA.sub account." },
  form: {
    title: "Create an account",
    description: "One account for everyday top-ups and, when you need it, a developer workspace.",
    fields: [
      { name: "name", label: "Full name", autoComplete: "name" },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "you@example.com",
        autoComplete: "email",
        hint: "We'll send a link to verify it.",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        autoComplete: "new-password",
        minLength: 12,
        hint: "At least 12 characters.",
      },
    ],
    submitLabel: "Create account",
    apiEndpoint: "/api/auth/sign-up",
    switchPrompt: { text: "Already have an account?", link: { label: "Log in", href: "/sign-in" } },
  } satisfies AuthFormProps,
};
