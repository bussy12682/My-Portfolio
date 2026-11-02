import type {
  AirtimeData,
  EmailData,
  EventData,
  PlanData,
  ReceiptData,
  UsageData,
} from "@/components/site/previews";
import type { CellItem } from "@rektinasub/ui/components/cell-strip";
import type { FaqItem } from "@rektinasub/ui/components/faq";
import type { FeaturePanel } from "@rektinasub/ui/components/feature-panels";
import type { HeroStat } from "@rektinasub/ui/components/hero";
import type { ServiceItem } from "@rektinasub/ui/components/service-list";
import type { StoryCardProps } from "@rektinasub/ui/components/story-card";
import type { ActionLink, LinkItem } from "@rektinasub/ui/lib/links";
import {
  GaugeIcon,
  HistoryIcon,
  KeyRoundIcon,
  MailCheckIcon,
  MailIcon,
  ReceiptTextIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  WebhookIcon,
  WifiIcon,
} from "lucide-react";

// Copy is grounded in what the product actually does (vtu_developer_infrastructure_vscode/docs/01-prd.md).
// No "cheapest" claims, no inbox-placement promises, no SMS API until it ships, no invented
// customers or numbers. Values inside product screens (IDs, prices, times) are illustrative.

const getStarted: ActionLink = { label: "Get Started", href: "/sign-up" };
const forDevelopers: ActionLink = { label: "For developers", href: "/developers" };
const docs: LinkItem = { label: "Read the docs", href: "/docs", status: "planned" };

// Screens -------------------------------------------------------------------------------------

const receipt: ReceiptData = {
  id: "Order ord_7Q2K9XW",
  status: "Delivered",
  rows: [
    { label: "Recipient", value: "0803 ••• 4521" },
    { label: "Plan", value: "Data · 2 GB · 30 days" },
    { label: "Paid with", value: "Card •••• 1182" },
  ],
  total: { label: "Total charged", value: "₦1,500.00" },
  timeline: [
    { label: "Price confirmed", meta: "12:00:04", state: "done" },
    { label: "Payment verified", meta: "12:00:11", state: "done" },
    { label: "Sent to network", meta: "12:00:12", state: "done" },
    { label: "Delivered, receipt issued", meta: "12:00:19", state: "done" },
  ],
};

const plans: PlanData = {
  recipient: "0803 412 4521",
  plans: [
    { name: "1 GB", detail: "Valid for 7 days", price: "₦500.00" },
    { name: "2 GB", detail: "Valid for 30 days", price: "₦1,500.00", selected: true },
    { name: "10 GB", detail: "Valid for 30 days", price: "₦5,000.00" },
  ],
  pay: "Pay ₦1,500.00",
};

const airtime: AirtimeData = {
  recipient: "0803 412 4521",
  amounts: [
    { value: "₦200" },
    { value: "₦500" },
    { value: "₦1,000", selected: true },
    { value: "₦2,000" },
  ],
  note: "You pay exactly ₦1,000.00. Nothing is added at checkout.",
  pay: "Pay ₦1,000.00",
};

const email: EmailData = {
  endpoint: "POST /v1/emails",
  request: `{
  "from": "receipts@yourapp.com",
  "to": ["ada@example.com"],
  "subject": "Your receipt",
  "metadata": { "order_id": "ord_7Q2K9XW" }
}`,
  response: `{
  "request_id": "req_8fK2mQ",
  "status": "queued"
}`,
};

const events: EventData = [
  { name: "email.queued", detail: "Delivered to your endpoint · 200", time: "12:00:20" },
  { name: "email.accepted", detail: "Delivered to your endpoint · 200", time: "12:00:21" },
  { name: "email.delivered", detail: "Retried once, then 200", time: "12:00:24", current: true },
];

const usage: UsageData = {
  period: "October",
  cap: { used: "₦18,400", limit: "₦50,000", percent: 37 },
  keys: [
    { name: "live_checkout", sends: "9,120 sends", percent: 72 },
    { name: "live_auth_codes", sends: "3,480 sends", percent: 28 },
    { name: "test_staging", sends: "412 sends", percent: 4 },
  ],
};

export const screens = { receipt, plans, airtime, email, events, usage };

// Sections ------------------------------------------------------------------------------------

export const homeContent = {
  announcement: {
    badge: "New",
    message: "Permitt, our email API for developers, is coming soon",
    link: { label: "Learn more", href: "/developers" } satisfies LinkItem,
  },

  hero: {
    eyebrow: "Airtime, data and email API",
    title: "Top up and send without the guesswork.",
    description:
      "Buy airtime and data at the price you see, with a receipt for every order. Building a product? Permitt puts transactional email behind one API.",
    actions: [getStarted, { ...forDevelopers, variant: "contrast" }] satisfies ActionLink[],
    stats: [
      { value: "One", label: "charge per order" },
      { value: "Final", label: "price before you pay" },
      { value: "Signed", label: "webhooks for developers" },
    ] satisfies HeroStat[],
    showcase: {
      label: "Now showing",
      link: { label: "How it works", href: "/#how-it-works" } satisfies LinkItem,
      slides: [
        { name: "Order receipt", detail: "Airtime & data" },
        { name: "Plan picker", detail: "Data bundles" },
        { name: "Email API", detail: "Permitt" },
      ],
    },
  },

  strip: [
    { label: "Airtime", icon: SmartphoneIcon },
    { label: "Data bundles", icon: WifiIcon },
    { label: "Email API", icon: MailIcon },
    { label: "Webhooks", icon: WebhookIcon },
    { label: "Usage & keys", icon: KeyRoundIcon },
  ] satisfies CellItem[],

  services: {
    id: "services",
    eyebrow: "What you can do",
    title: "Top up any line.\nSend from your own product.",
    description:
      "Everyday airtime and data for you, and a transactional email API for the product you're building. One account for both.",
    items: [
      {
        id: "airtime",
        title: "Airtime",
        summary:
          "Top up your own line or someone else's. The amount you choose is the amount you pay, and the receipt lands in your history as soon as the network confirms.",
        points: [
          "Final price before you pay",
          "Payment verified before anything is sent",
          "A status and receipt for every order",
          "Refund or credit if a top-up fails",
        ],
        link: { label: "Buy airtime", href: "/airtime" },
      },
      {
        id: "data",
        title: "Data bundles",
        summary:
          "Compare bundles by size, validity and price on one screen, then follow the order to its final status: delivered, failed or refunded.",
        points: [
          "Size, validity and price side by side",
          "Buy for any number, not just your own",
          "Every order traceable by its ID",
          "Order history you can come back to",
        ],
        link: { label: "Browse data bundles", href: "/data" },
      },
      {
        id: "email",
        title: "Email API",
        summary:
          "Send receipts, alerts and one-time codes from your own domain with one REST call. Every message gets a request ID you can follow from queued to delivered.",
        points: [
          "One endpoint, JSON in and out",
          "Production sends only from verified domains",
          "Delivery, bounce and complaint events",
          "Request IDs on every response",
        ],
        link: { label: "Explore the Email API", href: "/developers/email-api" },
      },
      {
        id: "webhooks",
        title: "Webhooks",
        summary:
          "Get events pushed to your endpoint as they happen. Every delivery is signed so you can verify it, retried if your server is down, and deduplicated so you process it once.",
        points: [
          "Signed payloads you can verify",
          "Automatic retries with backoff",
          "Deduplicated by event ID",
          "Order and email events in one stream",
        ],
        link: docs,
      },
      {
        id: "usage",
        title: "Usage & keys",
        summary:
          "See what every workspace and API key is sending and spending. Set a cap so a bug can't run up a bill, and rotate or revoke keys in seconds.",
        points: [
          "Usage per workspace and per key",
          "Spending caps you control",
          "Keys shown once, scoped to what they need",
          "Rotate or revoke at any time",
        ],
        link: { label: "See the platform", href: "/developers" },
      },
    ] satisfies Omit<ServiceItem, "visual">[],
  },

  panels: [
    {
      title: "For everyday top-ups",
      description:
        "Recharge your own line or someone else's, check the price first, and keep every receipt in one place.",
      icons: [
        { icon: SmartphoneIcon, label: "Airtime" },
        { icon: WifiIcon, label: "Data" },
        { icon: ReceiptTextIcon, label: "Receipts" },
        { icon: HistoryIcon, label: "Order history" },
      ],
      link: { label: "Buy airtime or data", href: "/airtime" },
      glow: true,
    },
    {
      eyebrow: "Permitt by REKTINA",
      title: "For developers",
      description:
        "Workspaces, verified domains, scoped keys and signed webhooks, with usage you can see per key.",
      iconStyle: "tiles",
      icons: [
        { icon: MailIcon, label: "Email API" },
        { icon: KeyRoundIcon, label: "API keys" },
        { icon: WebhookIcon, label: "Webhooks" },
        { icon: GaugeIcon, label: "Usage" },
        { icon: ScrollTextIcon, label: "Logs" },
      ],
      link: docs,
    },
  ] satisfies [FeaturePanel, FeaturePanel],

  stories: {
    id: "how-it-works",
    eyebrow: "Under the hood",
    title: "Two journeys,\nstart to finish.",
    items: [
      {
        name: "REKTINA.sub",
        tags: [{ label: "Personal", tone: "accent" }, { label: "Data bundle" }],
        meta: "Example order",
        title: "From plan to receipt, with every step on record",
        description:
          "Pick a 2 GB bundle, see ₦1,500.00, pay. We verify the payment before anything is sent to the network, then record the network's answer on your receipt.",
        link: { label: "Buy data", href: "/data" },
        note: {
          text: "Tapped pay twice by accident? Each order carries one ID, so the second tap returns the same order instead of charging you again.",
          title: "One order, one charge",
          detail: "Built into every purchase",
          icon: ShieldCheckIcon,
        },
      },
      {
        name: "Permitt",
        tags: [{ label: "Developers", tone: "accent" }, { label: "Email API" }],
        meta: "Example request",
        title: "One request ID from send to delivered",
        description:
          "Send a message from a verified domain and get a request ID back. Follow it through queued, accepted and delivered, by webhook or in your logs.",
        link: docs,
        note: {
          text: "A 202 means we accepted your message, not that it reached the inbox. Delivery, bounce and complaint events arrive as the provider reports them.",
          title: "Honest delivery status",
          detail: "No inbox promises",
          icon: MailCheckIcon,
        },
        reverse: true,
      },
    ] satisfies Omit<StoryCardProps, "visual">[],
  },

  faq: {
    id: "faq",
    eyebrow: "FAQ",
    title: "Questions,\nanswered plainly.",
    items: [
      {
        question: "What happens if my top-up fails?",
        answer:
          "Every order ends in a final status. If a network can't complete it, we reconcile the order and refund or credit you, and the reason is recorded on your receipt.",
      },
      {
        question: "Can I be charged twice for the same order?",
        answer:
          "No. Each order has a unique ID, so retrying, refreshing or tapping pay twice won't create a second charge or a second top-up.",
      },
      {
        question: "What is Permitt?",
        answer:
          "Permitt is REKTINA's developer platform. It gives your product an email API with workspaces, domain verification, scoped API keys, delivery logs and signed webhooks.",
      },
      {
        question: "Do you guarantee my emails reach the inbox?",
        answer:
          "Nobody honestly can. We require verified senders, report delivery, bounce and complaint events as providers send them, and give you the logs to act on them.",
      },
      {
        question: "Is there an SMS API?",
        answer:
          "Not yet. SMS comes after the email API, once it's stable and its abuse controls are proven.",
      },
    ] satisfies FaqItem[],
  },

  closing: {
    eyebrow: "Ready when you are",
    title: "Top up a line, or send\nyour first email.",
    description: "Create an account in minutes. Add a developer workspace whenever you're ready.",
    actions: [getStarted] satisfies ActionLink[],
  },
};
