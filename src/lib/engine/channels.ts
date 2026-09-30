/**
 * Channel orchestrator: picks where (and whether) to reach the customer.
 * Messaging outside the app is reserved for time-sensitive or truly meaningful
 * moments, and is held back when the customer was contacted recently.
 */
import type { Channel, CustomerState } from "@/lib/types/domain";
import type { Opportunity, RelevanceBreakdown } from "@/lib/types/intelligence";

export function chooseChannel(
  opp: Opportunity,
  relevance: RelevanceBreakdown,
  state: CustomerState,
): { channel: Channel; reason: string } {
  const p = state.preferences;
  if (opp.type === "contextual_decision") return { channel: "app", reason: "Answered inside the conversation" };
  if (!relevance.surfaced) return { channel: "app", reason: "Not surfaced - visible only in the intelligence log" };

  const messagingAllowed = p.channels.whatsapp && p.consent.messagingChannel;
  const goal = state.goals.find((g) => g.id === opp.relatedGoalId);
  const wantsMessaging =
    (opp.tone === "risk" && relevance.urgency >= 80) ||
    (opp.type === "milestone" && p.milestoneNotifications && state.profile.preferredChannel === "whatsapp" && goal?.priority === "high");

  if (!wantsMessaging) return { channel: "app", reason: "Not time-critical - waits calmly in the app feed" };
  if (!messagingAllowed) return { channel: "app", reason: "Messaging channel not enabled by customer" };
  if (relevance.messagingScore < relevance.threshold) {
    return { channel: "app", reason: `Message held back: contacted recently (messaging score ${relevance.messagingScore} < ${relevance.threshold})` };
  }
  return {
    channel: "whatsapp",
    reason: opp.tone === "risk" ? "Time-sensitive risk on the customer's preferred channel" : "Major milestone on a high-priority goal - occasional positive update",
  };
}
