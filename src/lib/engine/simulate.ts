/**
 * Decision support: affordability and what-if simulations.
 * Rules: the emergency fund is never used, and anything not covered by headroom
 * or unallocated surplus is assumed to pause the primary long-term goal.
 */
import type { CustomerState, Goal } from "@/lib/types/domain";
import type { GoalImpact } from "@/lib/types/intelligence";
import { addMonths } from "@/lib/utils/dates";
import { goalImpact } from "./goals";
import { cashflowForecast } from "./signals";

/** Months of unallocated surplus we allow to rebuild the safety balance after a planned purchase. */
export const REFILL_MONTHS = 6;

export interface AffordabilityOption {
  amount: number;
  delayWeeks: number;
  impact: GoalImpact;
  noImpact: boolean;
}

export interface AffordabilityResult {
  amount: number;
  purpose: string;
  verdict: "comfortable" | "tradeoff" | "stretch";
  capacity: number;
  headroom: number;
  monthlySurplus: number;
  bufferRestoredBy: string;
  primaryGoal: Goal;
  options: AffordabilityOption[];
  signals: string[];
}

export function primaryGoal(state: CustomerState): Goal {
  const candidates = state.goals.filter((g) => g.type !== "emergency" && g.currentAmount < g.targetAmount);
  const order = { high: 0, medium: 1, low: 2 };
  return [...candidates].sort((a, b) => order[a.priority] - order[b.priority] || b.targetAmount - a.targetAmount)[0] ?? state.goals[0];
}

export function affordability(state: CustomerState, amount: number, purpose = "purchase"): AffordabilityResult {
  const forecast = cashflowForecast(state);
  const buffer = state.profile.safetyBuffer;
  const surplus = Math.max(0, forecast.monthlySurplus);
  const headroom = Math.max(0, forecast.lowestProjected + surplus - buffer);
  const capacity = Math.floor((headroom + surplus * REFILL_MONTHS) / 50) * 50;
  const goal = primaryGoal(state);

  const option = (value: number): AffordabilityOption => {
    const excess = Math.max(0, value - capacity);
    const delayMonths = goal.monthlyContribution > 0 ? excess / goal.monthlyContribution : 0;
    const impact = goalImpact(goal, state.today, { delayMonths });
    return { amount: value, delayWeeks: Math.round((delayMonths * 30.4375) / 7), impact, noImpact: excess === 0 };
  };

  const amounts = new Set<number>([amount]);
  if (capacity < amount) {
    const mid = Math.round((amount * 0.75) / 100) * 100;
    if (mid > capacity) amounts.add(mid);
    amounts.add(Math.max(100, Math.floor(capacity / 100) * 100));
  }
  const options = [...amounts].sort((a, b) => b - a).map(option);
  const main = options[0];
  const verdict = main.noImpact ? "comfortable" : main.delayWeeks <= 13 ? "tradeoff" : "stretch";
  const bufferDip = Math.max(0, Math.min(amount, capacity) - headroom);
  const refillMonths = surplus > 0 ? Math.ceil(bufferDip / surplus) : 0;

  return {
    amount,
    purpose,
    verdict,
    capacity,
    headroom: Math.round(headroom),
    monthlySurplus: surplus,
    bufferRestoredBy: addMonths(state.today, 1 + refillMonths),
    primaryGoal: goal,
    options,
    signals: [
      `Current account: €${forecast.currentBalance.toLocaleString("en-IE")}`,
      `Projected lowest balance before payday: €${forecast.lowestProjected.toLocaleString("en-IE")}`,
      `Typical unallocated surplus since your raise: €${surplus}/month`,
      `Safety balance you chose: €${buffer.toLocaleString("en-IE")}`,
      `Emergency fund kept untouched`,
    ],
  };
}

/** Projected date if a goal's monthly contribution changes. */
export function whatIfMonthly(state: CustomerState, goalId: string, monthlyDelta: number, oneOff = 0): GoalImpact {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) throw new Error(`Unknown goal ${goalId}`);
  return goalImpact(goal, state.today, { monthlyDelta, oneOff });
}