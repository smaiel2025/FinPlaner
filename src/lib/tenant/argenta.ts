import { ALL_DETECTOR_IDS } from "@/lib/engine/opportunities";
import type { Tenant } from "./types";

/**
 * Inspired by the Argenta site (argenta.be): light header, green wordmark,
 * links across the top. Not the official leaf logo or brand assets.
 */
export const argenta: Tenant = {
  id: "argenta",
  bankName: "Argenta",
  productName: "Financial Co-Pilot",
  monogram: "Argenta",
  advisorLabel: "Argenta advisor",
  appChannelLabel: "Argenta app",
  webChannelLabel: "Argenta Internet Banking",
  disclaimer: "Not personal financial advice. Regulated decisions are handed to an Argenta advisor.",
  dataUse: [
    "Transactions and balances from your Argenta accounts, to detect patterns and forecast cashflow.",
    "Your goals and the preferences on this page.",
    "Facts you shared in conversation - only if memory is on, and you can delete them below.",
    "Never: data from outside Argenta, your contacts, location or any third-party profiles.",
  ],
  healthScoreNote:
    "This score was designed for the prototype. It is not an official Argenta metric and is never used for credit decisions.",
  colors: { ink: "#16323c", brand: "#00a160", brand600: "#00814d", brand50: "#e8f6ef" },
  layout: "topnav",
  header: "soft",
  enabledDetectors: [...ALL_DETECTOR_IDS],
};
