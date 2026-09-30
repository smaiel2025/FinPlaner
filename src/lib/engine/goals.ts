/**
 * Goal projections: deterministic, explainable arithmetic (no interest assumed).
 */
import type { CustomerState, Goal, ISODate } from "@/lib/types/domain";
import type { GoalImpact, GoalProjection } from "@/lib/types/intelligence";
import { addDays, addFractionalMonths, addMonths, monthKey, monthsBetween } from "@/lib/utils/dates";

export function projectDate(remaining: number, monthly: number, from: ISODate): ISODate | null {
  if (remaining <= 0) return from;
  if (monthly <= 0) return null;
  return addFractionalMonths(from, remaining / monthly);
}

export function requiredMonthly(goal: Goal, today: ISODate): number {
  const months = Math.max(1, monthsBetween(today, goal.targetDate));
  return Math.max(0, (goal.targetAmount - goal.currentAmount) / months);
}

function likelihood(ratio: number): { label: GoalProjection["likelihood"]; pct: number } {
  const pct = Math.round(Math.max(5, Math.min(97, 50 + (ratio - 0.9) * 350)));
  return { label: pct >= 75 ? "High" : pct >= 50 ? "Medium" : "Low", pct };
}

export function projectGoal(goal: Goal, today: ISODate, overrides: { current?: number; monthly?: number } = {}): GoalProjection {
  const current = overrides.current ?? goal.currentAmount;
  const monthly = overrides.monthly ?? goal.monthlyContribution;
  const g = { ...goal, currentAmount: current, monthlyContribution: monthly };
  const remaining = Math.max(0, goal.targetAmount - current);
  const required = requiredMonthly(g, today);
  const projectedDate = projectDate(remaining, monthly, today);
  const monthsAhead = projectedDate ? monthsBetween(projectedDate, goal.targetDate) : -99;
  const ratio = required > 0 ? monthly / required : 2;
  const lk = likelihood(ratio);

  const ninetyDaysAgo = monthKey(addDays(today, -90));
  const past = goal.history.filter((h) => h.month <= ninetyDaysAgo);
  const baseline = past.length ? past[past.length - 1].amount : goal.history[0]?.amount ?? current;

  return {
    goal: g,
    progress: Math.min(1, current / goal.targetAmount),
    remaining,
    requiredMonthly: Math.round(required),
    projectedDate,
    monthsAheadOfTarget: Math.round(monthsAhead * 10) / 10,
    onTrack: monthsAhead >= -0.5,
    likelihood: lk.label,
    likelihoodPct: lk.pct,
    last90Days: Math.max(0, Math.round(current - baseline)),
    nextMilestone: goal.milestoneAmounts.find((m) => m > current) ?? null,
    milestonesReached: goal.milestoneAmounts.filter((m) => m <= current),
  };
}

export function projectAll(state: CustomerState): GoalProjection[] {
  return state.goals.map((g) => projectGoal(g, state.today));
}

/** Before/after view of a change to a goal (one-off amount and/or monthly change). */
export function goalImpact(
  goal: Goal,
  today: ISODate,
  change: { oneOff?: number; monthlyDelta?: number; delayMonths?: number },
): GoalImpact {
  const before = projectGoal(goal, today);
  const after = projectGoal(goal, today, {
    current: goal.currentAmount + (change.oneOff ?? 0),
    monthly: goal.monthlyContribution + (change.monthlyDelta ?? 0),
  });
  let projectedAfter = after.projectedDate;
  if (projectedAfter && change.delayMonths) projectedAfter = addFractionalMonths(projectedAfter, change.delayMonths);
  const weeksShift =
    before.projectedDate && projectedAfter ? (monthsBetween(projectedAfter, before.projectedDate) * 30.4375) / 7 : 0;
  return {
    goalId: goal.id,
    goalName: goal.name,
    progressBefore: before.progress,
    progressAfter: after.progress,
    projectedBefore: before.projectedDate,
    projectedAfter,
    weeksShift: Math.round(weeksShift * 10) / 10,
  };
}

/** Month-by-month projected balance, used for forecast charts. */
export function projectionSeries(goal: Goal, today: ISODate, monthly = goal.monthlyContribution, months = 48) {
  const out: { month: string; amount: number }[] = [];
  let amount = goal.currentAmount;
  for (let i = 0; i <= months && amount < goal.targetAmount + monthly; i++) {
    out.push({ month: monthKey(addMonths(today, i)), amount: Math.min(goal.targetAmount, Math.round(amount)) });
    amount += monthly;
  }
  return out;
}
