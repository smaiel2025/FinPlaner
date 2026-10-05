import { ALL_DETECTOR_IDS } from "@/lib/engine/opportunities";
import type { Tenant } from "./types";

/**
 * Inspired by the ING Belgium individuals site (ing.be): white header, orange
 * wordmark, links across the top. Not the official lion logo or brand assets.
 */
export const ing: Tenant = {
  id: "ing",
  bankName: "ING",
  productName: "Financial Co-Pilot",
  monogram: "ING",
  advisorLabel: "ING advisor",
  appChannelLabel: "ING App",
  webChannelLabel: "Home'Bank",
  disclaimer: "Not personal financial advice. Regulated decisions are handed to an ING advisor.",
  dataUse: [
    "Transactions and balances from your ING accounts, to detect patterns and forecast cashflow.",
    "Your goals and the preferences on this page.",
    "Facts you shared in conversation - only if memory is on, and you can delete them below.",
    "Never: data from outside ING, your contacts, location or any third-party profiles.",
  ],
  healthScoreNote:
    "This score was designed for the prototype. It is not an official ING metric and is never used for credit decisions.",
  colors: { ink: "#1a1a1a", brand: "#ff6200", brand600: "#e05600", brand50: "#fff4ec" },
  layout: "topnav",
  enabledDetectors: [...ALL_DETECTOR_IDS],
};
