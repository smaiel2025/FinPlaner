import { ALL_DETECTOR_IDS } from "@/lib/engine/opportunities";
import type { Tenant } from "./types";

/**
 * Inspired by the BNP Paribas Fortis individuals site: white header, green
 * wordmark, links across the top. Not the official star logo or brand assets.
 */
export const bnp: Tenant = {
  id: "bnp",
  bankName: "BNP Paribas Fortis",
  productName: "Financial Co-Pilot",
  monogram: "BNP Paribas Fortis",
  advisorLabel: "BNP Paribas Fortis advisor",
  appChannelLabel: "Easy Banking App",
  webChannelLabel: "Easy Banking Web",
  disclaimer: "Not personal financial advice. Regulated decisions are handed to a BNP Paribas Fortis advisor.",
  dataUse: [
    "Transactions and balances from your BNP Paribas Fortis accounts, to detect patterns and forecast cashflow.",
    "Your goals and the preferences on this page.",
    "Facts you shared in conversation - only if memory is on, and you can delete them below.",
    "Never: data from outside BNP Paribas Fortis, your contacts, location or any third-party profiles.",
  ],
  healthScoreNote:
    "This score was designed for the prototype. It is not an official BNP Paribas Fortis metric and is never used for credit decisions.",
  colors: { ink: "#333333", brand: "#00965e", brand600: "#007a4c", brand50: "#e7f6ef" },
  layout: "topnav",
  header: "utility",
  enabledDetectors: [...ALL_DETECTOR_IDS],
};
