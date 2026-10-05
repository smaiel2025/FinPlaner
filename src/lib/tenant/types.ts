/** Bank skin and policy. The screens stay the same; this is what a host bank swaps. */
export interface TenantColors {
  ink: string;
  brand: string;
  brand600: string;
  brand50: string;
}

export interface Tenant {
  id: string;
  bankName: string;
  productName: string;
  monogram: string;
  advisorLabel: string;
  appChannelLabel: string;
  webChannelLabel: string;
  disclaimer: string;
  dataUse: string[];
  healthScoreNote: string;
  colors: TenantColors;
  /** Sidebar is the current prototype chrome. Top nav matches a retail-bank header. */
  layout: "sidebar" | "topnav";
  /**
   * Top-nav chrome. "stripe" is the ING bar. "utility" is a plain white header.
   * "soft" is Argenta's light header. "rule" is Belfius's thin dark line.
   */
  header?: "stripe" | "utility" | "soft" | "rule";
  /** Detector ids that run for this bank. Relevance, approval and channels stay shared. */
  enabledDetectors: string[];
}
