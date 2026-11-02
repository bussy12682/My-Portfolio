import type { FaqItem } from "@rektinasub/ui/components/faq";
import type { HeroStat } from "@rektinasub/ui/components/hero";
import type { StepItem } from "@rektinasub/ui/components/step-list";
import type { StoryCardProps } from "@rektinasub/ui/components/story-card";
import type { ActionLink } from "@rektinasub/ui/lib/links";
import { RotateCcwIcon, ShieldCheckIcon } from "lucide-react";
import type { ReceiptData } from "@/components/site/previews";
import { getStarted, routes } from "@/config/links";

// Airtime and data pages. Facts come from the PRD (01-prd.md); screen values are illustrative.

const sharedFaq = {
  account: {
    question: "Do I need an account?",
    answer:
      "Yes. An account keeps your receipts and order history in one place, and gives every order an ID we can trace if something goes wrong.",
  },
  failed: {
    question: "What happens if a top-up fails?",
    answer:
      "Every order ends in a final status. If a network can't complete it, we reconcile the order and refund or credit you, and the reason is recorded on your receipt.",
  },
  twice: {
    question: "Can I be charged twice for the same order?",
    answer:
      "No. Each order has a unique ID, so retrying, refreshing or tapping pay twice won't create a second charge or a second top-up.",
  },
} satisfies Record<string, FaqItem>;

export const refundedReceipt: ReceiptData = {
  id: "Order ord_3LM8QZA",
  status: "Refunded",
  rows: [
    { label: "Recipient", value: "0816 ••• 0937" },
    { label: "Airtime", value: "₦2,000.00" },
    { label: "Paid with", value: "Card •••• 1182" },
  ],
  total: { label: "Refunded", value: "₦2,000.00" },
  timeline: [
    { label: "Price confirmed", meta: "09:14:02", state: "done" },
    { label: "Payment verified", meta: "09:14:09", state: "done" },
    { label: "Network didn't confirm", meta: "09:16:10", state: "done" },
    { label: "Refunded, reason on receipt", meta: "09:21:44", state: "current" },
  ],
};

const stats = [
  { value: "Final", label: "price before you pay" },
  { value: "One", label: "charge per order" },
  { value: "Every", label: "order gets a receipt" },
] satisfies HeroStat[];

export const airtimePage = {
  meta: {
    title: "Airtime",
    description: "Top up any line at the price you see, with a receipt for every order.",
  },
  hero: {
    eyebrow: "Personal · Airtime",
    title: "Airtime for any line, at the price you see.",
    description:
      "Top up your own number or someone else's. Choose an amount, confirm the exact total, and get a receipt the moment the network confirms.",
    actions: [getStarted, { ...routes.pricing, variant: "contrast" }] satisfies ActionLink[],
    stats,
  },
  steps: {
    eyebrow: "How it works",
    title: "Four steps,\nno surprises.",
    items: [
      {
        title: "Enter the number",
        description:
          "Your own line or anyone else's. The number is saved on the order so the receipt shows exactly where the airtime went.",
      },
      {
        title: "Choose an amount",
        description:
          "Pick a preset or type your own. The total you'll pay is shown before you go any further.",
      },
      {
        title: "Confirm and pay",
        description:
          "We verify your payment with the provider before anything is sent to the network.",
      },
      {
        title: "Get your receipt",
        description:
          "The order ends delivered, failed or refunded, and stays in your history with its ID.",
      },
    ] satisfies StepItem[],
  },
  story: {
    name: "REKTINA.sub",
    tags: [{ label: "Personal", tone: "accent" }, { label: "Airtime" }],
    meta: "Example order",
    title: "If a top-up fails, you'll know why",
    description:
      "Networks sometimes don't confirm. When that happens we reconcile the order, refund or credit you, and write the reason on the receipt instead of leaving it pending.",
    link: routes.data,
    note: {
      text: 'An order never stays "processing" forever. It ends delivered, failed or refunded, and you can see which and when.',
      title: "A final answer for every order",
      detail: "Traceable by its ID",
      icon: RotateCcwIcon,
    },
  } satisfies Omit<StoryCardProps, "visual">,
  faq: {
    eyebrow: "FAQ",
    title: "Airtime,\nanswered plainly.",
    items: [
      {
        question: "Can I top up someone else's number?",
        answer:
          "Yes. Enter any number when you order. The receipt records the number the airtime was sent to.",
      },
      sharedFaq.account,
      {
        question: "How do I know the top-up went through?",
        answer:
          "Your order shows its status as it moves from payment to delivery, and you get a receipt once the network confirms.",
      },
      sharedFaq.failed,
      sharedFaq.twice,
    ] satisfies FaqItem[],
  },
  closing: {
    eyebrow: "Ready when you are",
    title: "Top up your\nfirst line.",
    description:
      "Create an account in minutes. Your receipts and order history live in one place from the first order.",
    actions: [getStarted] satisfies ActionLink[],
  },
};

export const dataPage = {
  meta: {
    title: "Data bundles",
    description:
      "Compare data bundles by size, validity and price, and follow every order to its final status.",
  },
  hero: {
    eyebrow: "Personal · Data bundles",
    title: "Data bundles, compared side by side.",
    description:
      "See size, validity and price on one screen, buy for any number, and follow the order until the network confirms it.",
    actions: [getStarted, { ...routes.pricing, variant: "contrast" }] satisfies ActionLink[],
    stats,
  },
  steps: {
    eyebrow: "How it works",
    title: "Pick, pay,\nand know it landed.",
    items: [
      {
        title: "Enter the number",
        description:
          "Buy for your own line or someone else's. The number stays on the order and the receipt.",
      },
      {
        title: "Compare bundles",
        description:
          "Bundles are listed by size, how long they last and what they cost, so the trade-off is obvious.",
      },
      {
        title: "Confirm and pay",
        description:
          "The total on the confirmation screen is what you pay. We verify the payment before sending anything.",
      },
      {
        title: "Track to delivered",
        description:
          "Follow the order to its final status. If it fails, you're refunded or credited and told why.",
      },
    ] satisfies StepItem[],
  },
  story: {
    name: "REKTINA.sub",
    tags: [{ label: "Personal", tone: "accent" }, { label: "Data bundle" }],
    meta: "Example order",
    title: "From plan to receipt, with every step on record",
    description:
      "Pick a 2 GB bundle, see ₦1,500.00, pay. We verify the payment before anything is sent to the network, then record the network's answer on your receipt.",
    link: routes.airtime,
    note: {
      text: "Tapped pay twice by accident? Each order carries one ID, so the second tap returns the same order instead of charging you again.",
      title: "One order, one charge",
      detail: "Built into every purchase",
      icon: ShieldCheckIcon,
    },
  } satisfies Omit<StoryCardProps, "visual">,
  faq: {
    eyebrow: "FAQ",
    title: "Data bundles,\nanswered plainly.",
    items: [
      {
        question: "How are bundles listed?",
        answer:
          "By data size, how long the bundle is valid and its price, side by side, so you can compare before you pick.",
      },
      {
        question: "Can I buy data for someone else?",
        answer:
          "Yes. Enter their number when you order. The receipt records where the bundle was sent.",
      },
      sharedFaq.account,
      sharedFaq.failed,
      sharedFaq.twice,
    ] satisfies FaqItem[],
  },
  closing: {
    eyebrow: "Ready when you are",
    title: "Buy your\nfirst bundle.",
    description:
      "Create an account in minutes. Every order comes with a receipt and a status you can check.",
    actions: [getStarted] satisfies ActionLink[],
  },
};
