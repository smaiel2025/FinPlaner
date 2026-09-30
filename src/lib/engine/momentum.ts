/**
 * Financial Momentum: the direction of travel, based only on the customer's own
 * history (never compared with other customers).
 */
import type { GoalProjection, HealthScore, Momentum } from "@/lib/types/intelligence";

export function computeMomentum(health: HealthScore, projections: GoalProjection[]): Momentum {
  const h = health.history;
  const threeMonthTrend = h.length >= 4 ? h[h.length - 1].score - h[h.length - 4].score : health.change;
  const onTrackShare = projections.length ? projections.filter((p) => p.onTrack).length / projections.length : 1;
  const value = Math.round(Math.max(0, Math.min(100, 50 + threeMonthTrend * 1.5 + health.change * 4 + (onTrackShare - 0.5) * 30)));

  if (value >= 60) {
    return { state: "Improving", value, message: "Your financial position improved this month, and most of your goals are on track." };
  }
  if (value >= 40) {
    return { state: "Steady", value, message: "Your position is broadly stable. Small adjustments can keep your goals on track." };
  }
  return { state: "Slowing", value, message: "Progress slowed recently. A few adjustments could help you regain momentum." };
}
