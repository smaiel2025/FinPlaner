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

export const DETECTORS: { name: string; run: Detector }[] = [
  { name: "Goal deviation", run: goalDeviation },
  { name: "Energy anomaly", run: energyAnomaly },
  { name: "Restaurant anomaly", run: restaurantAnomaly },
  { name: "Subscriptions", run: subscriptions },
  { name: "Liquidity & surplus", run: liquidityAndSurplus },
  { name: "Cash-flow risk", run: cashflowRisk },
  { name: "Milestones", run: milestones },
  { name: "Positive behaviour", run: positiveBehavior },
  { name: "Contextual decision", run: contextualDecision },
];

export function detectOpportunities(state: CustomerState, projections: GoalProjection[]): Opportunity[] {
  return DETECTORS.flatMap((d) => d.run(state, projections));
}
