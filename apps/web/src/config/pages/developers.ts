import type { FaqItem } from "@rektinasub/ui/components/faq";
import type { HeroStat } from "@rektinasub/ui/components/hero";
import type { ServiceItem } from "@rektinasub/ui/components/service-list";
import type { StepItem } from "@rektinasub/ui/components/step-list";
import type { StoryCardProps } from "@rektinasub/ui/components/story-card";
import type { ActionLink } from "@rektinasub/ui/lib/links";
import { MailCheckIcon, ShieldAlertIcon } from "lucide-react";
import type { DomainData } from "@/components/site/previews";
import { routes } from "@/config/links";

// Permitt pages. Facts come from the PRD and API docs (01-prd.md, 06-api-docs.md); screen values
// are illustrative. Permitt is for transactional email: no campaigns, no inbox promises, no SMS yet.

const createWorkspace: ActionLink = { label: "Create a workspace", href: "/sign-up" };
const docs: ActionLink = { ...routes.docs, variant: "contrast" };

export const domains: DomainData = {
  workspace: "Workspace · Checkout",
  domains: [
    { name: "yourapp.com", status: "Verified", records: "SPF · DKIM · Return-path" },
    { name: "mail.yourapp.com", status: "Pending", records: "Waiting for DKIM record" },
  ],
};

const stats = [
  { value: "One", label: "request ID per message" },
  { value: "Signed", label: "webhooks, retried" },
  { value: "Per-key", label: "usage and caps" },
] satisfies HeroStat[];

const devFaq = {
  transactional: {
    question: "Can I send marketing campaigns?",
    answer:
      "No. Permitt is built for transactional email: receipts, alerts, password resets and one-time codes. Bulk marketing campaigns aren't supported.",
  },
  inbox: {
    question: "Do you guarantee my emails reach the inbox?",
    answer:
      "Nobody honestly can. We require verified senders, report delivery, bounce and complaint events as providers send them, and give you the logs to act on them.",
  },
  keys: {
    question: "How do API keys work?",
    answer:
      "Keys are scoped to what they need and shown once when you create them. Store them in your secrets manager; you can rotate or revoke a key at any time.",
  },
  access: {
    question: "When can I start sending?",
    answer:
      "Permitt opens as an allowlisted beta first. Create an account now and you can request developer access when workspaces open.",
  },
  sms: {
    question: "Is there an SMS API?",
    answer:
      "Not yet. SMS comes after the email API, once it's stable and its abuse controls are proven.",
  },
} satisfies Record<string, FaqItem>;

export const developersPage = {
  meta: {
    title: "Developers",
    description:
      "Permitt by REKTINA: an email API with workspaces, verified domains, scoped keys and signed webhooks.",
  },
  hero: {
    eyebrow: "Permitt by REKTINA",
    title: "Email infrastructure you can see into.",
    description:
      "Workspaces, verified domains, scoped API keys and signed webhooks. Every message gets a request ID you can follow from queued to delivered.",
    actions: [createWorkspace, docs] satisfies ActionLink[],
    stats,
  },
  capabilities: {
    eyebrow: "The platform",
    title: "Everything around the send,\nnot just the send.",
    description: "The parts you'd otherwise assemble from separate vendors, in one workspace.",
    items: [
      {
        id: "email",
        title: "Email API",
        summary:
          "One REST endpoint for receipts, alerts and one-time codes. JSON in, a request ID out, and a status you can follow.",
        points: [
          "Validates recipients, sender and content",
          "Request ID on every response",
          "Clear error codes, such as sender_not_verified",
          "Idempotent retries",
        ],
        link: routes.emailApi,
      },
      {
        id: "domains",
        title: "Domains & senders",
        summary:
          "Verify the domains you send from. Production sends from unverified senders are blocked, which protects your reputation and ours.",
        points: [
          "SPF and DKIM checks",
          "Per-workspace sender list",
          "Production blocked until verified",
          "Test sends while you set up",
        ],
        link: routes.docs,
      },
      {
        id: "webhooks",
        title: "Webhooks",
        summary:
          "Events pushed to your endpoint as they happen: signed so you can verify them, retried if you're down, deduplicated so you process each once.",
        points: [
          "Signed payloads",
          "Automatic retries with backoff",
          "Deduplicated by event ID",
          "Queued, accepted, delivered, bounced, complained, failed",
        ],
        link: routes.docs,
      },
      {
        id: "usage",
        title: "Usage & keys",
        summary:
          "See what every workspace and key sends and spends. Set a cap so a bug can't run up a bill, and rotate or revoke keys in seconds.",
        points: [
          "Usage per workspace and per key",
          "Spending caps you control",
          "Keys shown once, scoped",
          "Rotate or revoke any time",
        ],
        link: routes.docs,
      },
    ] satisfies Omit<ServiceItem, "visual">[],
  },
  steps: {
    eyebrow: "Getting started",
    title: "From sign-up\nto first send.",
    items: [
      {
        title: "Create a workspace",
        description:
          "Workspaces keep keys, domains, usage and logs separate, so staging never touches production.",
      },
      {
        title: "Verify your domain",
        description:
          "Add the DNS records we give you. Until the domain is verified, production sends are blocked.",
      },
      {
        title: "Create an API key",
        description:
          "Scope it to what it needs. It's shown once, so put it straight into your secrets manager.",
      },
      {
        title: "Send and watch events",
        description:
          "POST to /v1/emails, keep the request ID, and follow it through webhooks or the logs.",
      },
    ] satisfies StepItem[],
  },
  story: {
    name: "Permitt",
    tags: [{ label: "Developers", tone: "accent" }, { label: "Email API" }],
    meta: "Example request",
    title: "One request ID from send to delivered",
    description:
      "Send a message from a verified domain and get a request ID back. Follow it through queued, accepted and delivered, by webhook or in your logs.",
    link: routes.emailApi,
    note: {
      text: "A 202 means we accepted your message, not that it reached the inbox. Delivery, bounce and complaint events arrive as the provider reports them.",
      title: "Honest delivery status",
      detail: "No inbox promises",
      icon: MailCheckIcon,
    },
  } satisfies Omit<StoryCardProps, "visual">,
  faq: {
    eyebrow: "FAQ",
    title: "Developer questions,\nanswered plainly.",
    items: [
      devFaq.access,
      devFaq.transactional,
      devFaq.keys,
      devFaq.inbox,
      devFaq.sms,
    ] satisfies FaqItem[],
  },
  closing: {
    eyebrow: "Build with Permitt",
    title: "Send your\nfirst email.",
    description: "Create an account, then request developer access when workspaces open.",
    actions: [createWorkspace] satisfies ActionLink[],
  },
};

export const emailApiPage = {
  meta: {
    title: "Email API",
    description:
      "Send transactional email with one request, and follow every message by its request ID.",
  },
  hero: {
    eyebrow: "Permitt · Email API",
    title: "Send transactional email with one request.",
    description:
      "POST a message from a verified domain and get a request ID back in milliseconds. Then follow it through queued, accepted and delivered.",
    actions: [createWorkspace, docs] satisfies ActionLink[],
    stats,
  },
  steps: {
    eyebrow: "Quickstart",
    title: "Four steps to\nyour first send.",
    items: [
      {
        title: "Verify your domain",
        description:
          "Add SPF and DKIM records for the domain you'll send from. Production sends wait until it's verified.",
      },
      {
        title: "Create a scoped key",
        description:
          "Give it only the send permission it needs. It's shown once; store it as a secret.",
      },
      {
        title: "POST /v1/emails",
        description:
          "Send from, to, subject and text or HTML. Add metadata such as your order ID to tie messages to your own records.",
      },
      {
        title: "Follow the request ID",
        description:
          "A 202 returns a request ID and a queued status. Webhooks and logs tell you what happens next.",
      },
    ] satisfies StepItem[],
  },
  story: {
    name: "Permitt",
    tags: [{ label: "Errors", tone: "accent" }, { label: "Email API" }],
    meta: "Example error",
    title: "Errors that tell you what to fix",
    description:
      "Every error has a stable code, a plain message and the request ID, so you can handle it in code and trace it in the logs.",
    link: routes.docs,
    note: {
      text: "Sending from a domain that isn't verified yet returns sender_not_verified instead of silently dropping the message.",
      title: "Fail loudly, not quietly",
      detail: "Stable error codes",
      icon: ShieldAlertIcon,
    },
    reverse: true,
  } satisfies Omit<StoryCardProps, "visual">,
  events: {
    name: "Permitt",
    tags: [{ label: "Webhooks", tone: "accent" }, { label: "Events" }],
    meta: "Example events",
    title: "Every status change, pushed to you",
    description:
      "Queued, accepted, delivered, bounced, complained and failed events arrive signed at your endpoint, and are retried until you acknowledge them.",
    link: routes.docs,
  } satisfies Omit<StoryCardProps, "visual">,
  errorCode: `{
  "error": {
    "code": "sender_not_verified",
    "message": "The sender domain must be verified before sending.",
    "request_id": "req_demo_123"
  }
}`,
  faq: {
    eyebrow: "FAQ",
    title: "Email API,\nanswered plainly.",
    items: [
      {
        question: "What does a 202 response mean?",
        answer:
          "That we accepted the message for processing and gave it a request ID. It doesn't mean it reached the inbox; delivery events tell you that.",
      },
      {
        question: "Can I retry a request safely?",
        answer:
          "Yes. Send the same idempotency key with the retry and you'll get the original result back instead of a duplicate email.",
      },
      devFaq.transactional,
      devFaq.inbox,
      devFaq.access,
    ] satisfies FaqItem[],
  },
  closing: developersPageClosing(),
};

function developersPageClosing() {
  return {
    eyebrow: "Build with Permitt",
    title: "Send your\nfirst email.",
    description: "Create an account, then request developer access when workspaces open.",
    actions: [createWorkspace] satisfies ActionLink[],
  };
}
