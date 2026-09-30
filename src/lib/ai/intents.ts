/**
 * Deterministic intent classifier. Covers the demo scenarios reliably without
 * any external API; an LLM can be layered on top for phrasing.
 */
export type Intent =
  | "hero"
  | "affordability"
  | "spending_why"
  | "save_for_goal"
  | "goal_statement"
  | "cashflow_options"
  | "progress"
  | "score"
  | "subscriptions"
  | "investing"
  | "insurance_coverage"
  | "credit"
  | "greeting"
  | "unknown";

export interface ParsedIntent {
  intent: Intent;
  amount?: number;
  years?: number;
  purpose?: string;
}

const PURPOSES = ["holiday", "vacation", "trip", "car", "laptop", "phone", "wedding", "sofa", "bike", "renovation", "concert"];

export function parseAmount(text: string): number | undefined {
  const m = text.replace(/\s/g, "").match(/€?(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(k)?€?/i);
  if (!m) return undefined;
  const raw = m[1];
  const normalised = /[.,]\d{3}$/.test(raw) ? raw.replace(/[.,]/g, "") : raw.replace(",", ".");
  const value = parseFloat(normalised) * (m[2] ? 1000 : 1);
  return Number.isFinite(value) && value >= 10 ? value : undefined;
}

function parseYears(text: string): number | undefined {
  const m = text.match(/(\d+|one|two|three|four|five)\s*(years?|yrs?)/i);
  if (!m) return undefined;
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  return words[m[1].toLowerCase()] ?? parseInt(m[1], 10);
}

export function classifyIntent(message: string): ParsedIntent {
  const t = message.toLowerCase().trim();
  const amount = parseAmount(t);
  const years = parseYears(t);
  const purpose = PURPOSES.find((p) => t.includes(p));

  if (/\b(invest|stocks?|etf|funds?|crypto|shares|portfolio)\b/.test(t) && !/afford/.test(t)) return { intent: "investing" };
  if (/(mortgage|borrow|credit|loan)/.test(t) && !/afford/.test(t)) return { intent: "credit" };
  if (/(cover(ed|age)|am i insured|insurance cover)/.test(t)) return { intent: "insurance_coverage" };
  if (/(show (me )?(my )?options|insurance|buffer|payment.*friday)/.test(t)) return { intent: "cashflow_options" };
  if (/(show me|what can i do|get back on track|put me back|house.*(slip|behind))/.test(t)) return { intent: "hero" };
  if (/(afford|can i (buy|spend|pay|book)|without hurting)/.test(t)) return { intent: "affordability", amount, purpose: purpose ?? "purchase" };
  if (/(how much).*(save|put aside|set aside)/.test(t)) return { intent: "save_for_goal", years, purpose };
  if (/(i('d| would)? (like|want|plan|hope) to|we want to|planning to).*(buy|get).*(house|home|apartment)/.test(t)) return { intent: "goal_statement", years };
  if (/(why|what).*(spend|spending)|spending more|spent more/.test(t)) return { intent: "spending_why" };
  if (/subscription/.test(t)) return { intent: "subscriptions" };
  if (/(score|health)/.test(t)) return { intent: "score" };
  if (/(progress|how am i doing|on track|my goals)/.test(t)) return { intent: "progress" };
  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(t)) return { intent: "greeting" };
  return { intent: "unknown", amount };
}
