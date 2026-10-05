import { ALL_DETECTOR_IDS } from "@/lib/engine/opportunities";
import type { Tenant } from "./types";

/**
 * Inspired by the KBC Belgium individuals site (kbc.be/particulieren): white header,
 * bright-blue wordmark, then links across the top.
 * Not the official KBC logo or brand assets.
 */
export const kbc: Tenant = {
  id: "kbc",
  bankName: "KBC",
  productName: "Financial Co-Pilot",
  monogram: "KBC",
  advisorLabel: "KBC advisor",
  appChannelLabel: "KBC Mobile app",
  webChannelLabel: "KBC Touch (web)",
  disclaimer: "Not personal financial advice. Regulated decisions are handed to a KBC advisor.",
  dataUse: [
    "Transactions and balances from your KBC accounts, to detect patterns and forecast cashflow.",
    "Your goals and the preferences on this page.",
    "Facts you shared in conversation - only if memory is on, and you can delete them below.",
    "Never: data from outside KBC, your contacts, location or any third-party profiles.",
  ],
  healthScoreNote:
    "This score was designed for the hackathon prototype. It is not an official KBC metric and is never used for credit decisions.",
  colors: { ink: "#0b1f3a", brand: "#00aeef", brand600: "#0096cf", brand50: "#e7f7fd" },
  layout: "topnav",
  header: "utility",
  enabledDetectors: [...ALL_DETECTOR_IDS],
};
