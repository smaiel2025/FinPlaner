/**
 * Opportunity & risk detection registry. Deterministic detectors produce
 * candidates with observable signals and raw scoring inputs; relevance.ts
 * decides what (if anything) reaches the customer.
 */
import type { CustomerState } from "@/lib/types/domain";
import type { GoalProjection, Opportunity } from "@/lib/types/intelligence";
import { cashflowRisk, contextualDecision } from "./detectors/cashflow";
import { goalDeviation, liquidityAndSurplus } from "./detectors/goals";
import { milestones, positiveBehavior } from "./detectors/progress";
import type { Detector } from "./detectors/shared";
import { energyAnomaly, restaurantAnomaly, subscriptions } from "./detectors/spending";

export const DETECTORS: { id: string; name: string; run: Detector }[] = [
  { id: "goal_deviation", name: "Goal deviation", run: goalDeviation },
  { id: "energy_anomaly", name: "Energy anomaly", run: energyAnomaly },
  { id: "restaurant_anomaly", name: "Restaurant anomaly", run: restaurantAnomaly },
  { id: "subscriptions", name: "Subscriptions", run: subscriptions },
  { id: "liquidity_surplus", name: "Liquidity & surplus", run: liquidityAndSurplus },
  { id: "cashflow_risk", name: "Cash-flow risk", run: cashflowRisk },
  { id: "milestones", name: "Milestones", run: milestones },
  { id: "positive_behavior", name: "Positive behaviour", run: positiveBehavior },
  { id: "contextual_decision", name: "Contextual decision", run: contextualDecision },
];

export const ALL_DETECTOR_IDS = DETECTORS.map((d) => d.id);

/** `enabledIds` omitted or empty runs the full registry (today's behaviour). */
export function detectOpportunities(state: CustomerState, projections: GoalProjection[], enabledIds?: string[]): Opportunity[] {
  const allow = enabledIds && enabledIds.length > 0 ? new Set(enabledIds) : null;
  return DETECTORS.filter((d) => !allow || allow.has(d.id)).flatMap((d) => d.run(state, projections));
}
