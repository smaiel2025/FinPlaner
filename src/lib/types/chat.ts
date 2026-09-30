import type { ConversationFact, ISODate } from "./domain";
import type { GoalProjection, HealthScore, ScoredOpportunity, SpendingCategory } from "./intelligence";
import type { AffordabilityResult } from "@/lib/engine/simulate";

export type ChatBlock =
  | { type: "affordability"; result: AffordabilityResult }
  | { type: "recommendation"; opportunity: ScoredOpportunity }
  | { type: "goalProgress"; projections: GoalProjection[] }
  | { type: "spending"; categories: SpendingCategory[] }
  | { type: "health"; health: HealthScore }
  | { type: "savingsPlan"; goalName: string; targetAmount: number; currentAmount: number; targetDate: ISODate; monthlyNeeded: number; currentMonthly: number }
  | { type: "memory"; fact: ConversationFact; proposal?: { goalId: string; targetDate: ISODate; label: string } }
  | { type: "advisor"; reason: string }
  | { type: "suggestions"; items: string[] };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  blocks?: ChatBlock[];
  /** Which layer phrased the text: a live LLM or the deterministic fallback. */
  source?: "llm" | "deterministic";
  /** Channel the message was exchanged on (conversation continuity across channels). */
  channel?: "app" | "whatsapp";
  createdAt: string;
}
