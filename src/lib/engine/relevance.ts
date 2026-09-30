/**
 * Relevance ranking: decides whether a detected opportunity is worth the
 * customer's attention. This is the anti-spam layer - positive news follows the
 * same rules as risks. Recent contact only dampens outbound messaging; the
 * calm in-app feed is not penalised.
 */
import type { CustomerState, Frequency } from "@/lib/types/domain";
import type { Opportunity, RelevanceBreakdown } from "@/lib/types/intelligence";
import { daysBetween } from "@/lib/utils/dates";

export const THRESHOLDS: Record<Frequency, number> = { minimal: 80, balanced: 65, proactive: 50 };

export const SCORE_WEIGHTS = { impact: 0.35, urgency: 0.25, goalRelevance: 0.25, confidence: 0.15 };

export function baseScore(inputs: Opportunity["inputs"]): number {
  return (
    inputs.impact * SCORE_WEIGHTS.impact +
    inputs.urgency * SCORE_WEIGHTS.urgency +
    inputs.goalRelevance * SCORE_WEIGHTS.goalRelevance +
    inputs.confidence * SCORE_WEIGHTS.confidence
  );
}

function suppression(opp: Opportunity, state: CustomerState, score: number, threshold: number): string | undefined {
  const p = state.preferences;
  const isAnswer = opp.type === "contextual_decision";
  const feedback = [...state.feedback].reverse().find((f) => f.key === opp.key);

  if (!p.consent.transactionAnalysis && !isAnswer) return "Transaction analysis consent withdrawn";
  if (p.neverRecommend.includes(opp.key)) return "You asked not to see this again";
  if (feedback?.outcome === "accepted") return "Already acted on";
  if (feedback?.outcome === "dismissed" && daysBetween(feedback.date, state.today) < 14) return "Dismissed recently (14-day cool-off)";
  if (opp.bundledInto) {
    const parentAccepted = state.feedback.some((f) => f.key === opp.bundledInto && f.outcome === "accepted");
    return parentAccepted ? "Addressed by an accepted recommendation" : "Covered by a broader recommendation";
  }
  if (isAnswer) return undefined;
  if (!p.topics[opp.topic]) return "Topic turned off by customer";
  if (opp.type === "milestone" && !p.milestoneNotifications) return "Milestone updates turned off";
  if (!p.proactiveEnabled) return "Proactive assistant turned off";
  if (score < threshold) return `Below relevance threshold (${score} < ${threshold})`;
  return undefined;
}

export function scoreOpportunity(opp: Opportunity, state: CustomerState, thresholdOverride?: number): RelevanceBreakdown {
  const threshold = thresholdOverride ?? THRESHOLDS[state.preferences.frequency];
  const recent = state.notifications.filter((n) => n.opportunityKey !== opp.key && daysBetween(n.date, state.today) <= 7).length;
  const frequencyPenalty = opp.inputs.urgency >= 80 ? 0 : Math.min(30, recent * 8);
  const score = Math.round(baseScore(opp.inputs));
  const messagingScore = Math.round(score * (1 - frequencyPenalty / 100));
  const suppressionReason = suppression(opp, state, score, threshold);
  return {
    ...opp.inputs,
    frequencyPenalty,
    score,
    messagingScore,
    threshold,
    surfaced: !suppressionReason,
    suppressionReason,
  };
}
