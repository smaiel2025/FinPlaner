/**
 * Customer intelligence entry point: raw state -> reusable customer context.
 * Everything here is deterministic; the AI layer only phrases the results.
 */
import type { CustomerState } from "@/lib/types/domain";
import type { ScoredOpportunity } from "@/lib/types/intelligence";
import { chooseChannel } from "./channels";
import { projectAll } from "./goals";
import { computeHealthScore } from "./healthScore";
import { computeAchievements, computePersonalBests, computeStreaks, reachedMilestones } from "./milestones";
import { computeMomentum } from "./momentum";
import { detectOpportunities } from "./opportunities";
import { buildFinancialProfile } from "./profile";
import { scoreOpportunity } from "./relevance";
import { cashflowForecast } from "./signals";

export function scoreAll(state: CustomerState, thresholdOverride?: number): ScoredOpportunity[] {
  const projections = projectAll(state);
  return detectOpportunities(state, projections)
    .map((opp) => {
      const relevance = scoreOpportunity(opp, state, thresholdOverride);
      const { channel, reason } = chooseChannel(opp, relevance, state);
      return { ...opp, relevance, channel, channelReason: reason };
    })
    .sort((a, b) => b.relevance.score - a.relevance.score);
}

export function analyzeCustomer(state: CustomerState) {
  const projections = projectAll(state);
  const health = computeHealthScore(state);
  const momentum = computeMomentum(health, projections);
  const streaks = computeStreaks(state);
  const opportunities = scoreAll(state);

  return {
    today: state.today,
    profile: state.profile,
    accounts: state.accounts,
    loans: state.loans,
    insurance: state.insurance,
    recurring: state.recurring,
    upcoming: state.upcoming,
    preferences: state.preferences,
    memory: state.memory,
    notifications: state.notifications,
    feedback: state.feedback,
    actions: state.actions,
    events: state.events,
    financial: buildFinancialProfile(state),
    forecast: cashflowForecast(state),
    health,
    momentum,
    projections,
    milestones: reachedMilestones(state),
    achievements: computeAchievements(state, projections, streaks),
    streaks,
    personalBests: computePersonalBests(state),
    opportunities,
    feed: opportunities.filter((o) => o.relevance.surfaced && o.type !== "contextual_decision"),
    recentTransactions: [...state.transactions].reverse().slice(0, 12),
  };
}

export type CustomerContext = ReturnType<typeof analyzeCustomer>;
