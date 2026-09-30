/**
 * Conversational signals: statements that should update the customer's
 * financial context. Facts are proposed, never applied silently.
 */
import type { ConversationFact, CustomerState, ISODate } from "@/lib/types/domain";
import { addMonths } from "@/lib/utils/dates";
import { monthYear } from "@/lib/utils/format";

export interface FactProposal {
  fact: ConversationFact;
  proposal?: { goalId: string; targetDate: ISODate; label: string };
}

export function houseTimelineFact(state: CustomerState, statement: string, years: number, id: string): FactProposal | null {
  const house = state.goals.find((g) => g.type === "house");
  if (!house || !years) return null;
  const targetDate = addMonths(state.today, years * 12);
  if (!state.preferences.consent.conversationMemory) return null;
  const proposal = { goalId: house.id, targetDate, label: `Update house deposit target date to ${monthYear(targetDate)}` };
  return {
    fact: {
      id,
      date: state.today,
      statement,
      fact: `Wants to buy a home within ${years} year${years === 1 ? "" : "s"} (by ${monthYear(targetDate)})`,
      status: "pending_confirmation",
      proposal,
    },
    proposal,
  };
}
