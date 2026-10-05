import { ALL_DETECTOR_IDS } from "@/lib/engine/opportunities";
import type { Tenant } from "./types";

/**
 * Inspired by the Belfius retail site (belfius.be): white header, a thin dark
 * rule, crimson wordmark, links across the top. Not the official logo or brand assets.
 */
export const belfius: Tenant = {
  id: "belfius",
  bankName: "Belfius",
  productName: "Financial Co-Pilot",
  monogram: "Belfius",
  advisorLabel: "Belfius advisor",
  appChannelLabel: "Belfius Mobile",
  webChannelLabel: "Belfius Direct Net",
  disclaimer: "Not personal financial advice. Regulated decisions are handed to a Belfius advisor.",
  dataUse: [
    "Transactions and balances from your Belfius accounts, to detect patterns and forecast cashflow.",
    "Your goals and the preferences on this page.",
    "Facts you shared in conversation - only if memory is on, and you can delete them below.",
    "Never: data from outside Belfius, your contacts, location or any third-party profiles.",
  ],
  healthScoreNote:
    "This score was designed for the prototype. It is not an official Belfius metric and is never used for credit decisions.",
  colors: { ink: "#1a1a1a", brand: "#c30045", brand600: "#9a0036", brand50: "#fde8ee" },
  layout: "topnav",
  header: "rule",
  enabledDetectors: [...ALL_DETECTOR_IDS],
};
