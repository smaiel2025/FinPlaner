/**
 * Next Best Action builders: turn a detected situation into concrete, reviewable
 * options with trade-offs and before/after goal impact. Nothing executes here.
 */
import type { CustomerState, Goal, RecurringPayment } from "@/lib/types/domain";
import type { ActionOption, CashflowForecast } from "@/lib/types/intelligence";
import { addDays } from "@/lib/utils/dates";
import { eur, longDate, monthYear, shortDate, weeksPhrase } from "@/lib/utils/format";
import { goalImpact } from "./goals";

export function goalRecoveryActions(
  state: CustomerState,
  goal: Goal,
  unused: RecurringPayment | undefined,
  surplusRedirect: number,
): ActionOption[] {
  const actions: ActionOption[] = [];
  if (unused) {
    const impact = goalImpact(goal, state.today, { monthlyDelta: unused.amount });
    actions.push({
      id: `cancel:${unused.id}`,
      kind: "cancel_subscription",
      label: `Stop ${unused.merchant} (${eur(unused.amount, true)}/month)`,
      description: `Not used since ${longDate(unused.lastUsed!)}. We prepare the cancellation request and redirect ${eur(unused.amount, true)}/month to your ${goal.name.toLowerCase()}.`,
      amount: unused.amount,
      goalId: goal.id,
      tradeOff: "You lose access to a service you have not used recently. You can resubscribe any time.",
      impact,
      recommended: true,
    });
  }
  if (surplusRedirect > 0) {
    const impact = goalImpact(goal, state.today, { monthlyDelta: surplusRedirect });
    actions.push({
      id: `contribution:${goal.id}:${surplusRedirect}`,
      kind: "adjust_contribution",
      label: `Add ${eur(surplusRedirect)}/month to your ${goal.name.toLowerCase()} transfer`,
      description: `Taken from money that typically stays unallocated since your salary increase. Your emergency fund and safety balance stay untouched.`,
      amount: surplusRedirect,
      goalId: goal.id,
      tradeOff: `Slightly less flexible spending money each month. Your projected date moves ${weeksPhrase(impact.weeksShift)} earlier.`,
      impact,
      recommended: true,
    });
  }
  return actions;
}

export function cashflowActions(state: CustomerState, forecast: CashflowForecast): ActionOption[] {
  const payday = addDays(forecast.nextSalaryDate, 1);
  const pending = state.goals.filter(
    (g) => g.type !== "emergency" && g.nextTransferDate > state.today && g.nextTransferDate < forecast.nextSalaryDate,
  );
  const actions: ActionOption[] = [];
  if (pending.length) {
    const total = pending.reduce((s, g) => s + g.monthlyContribution, 0);
    actions.push({
      id: `reschedule:${pending.map((g) => g.id).join("+")}:${payday}`,
      kind: "reschedule_transfer",
      label: `Move this month's ${pending.map((g) => g.name.toLowerCase()).join(" and ")} transfers to just after payday`,
      description: `${eur(total)} leaves your account on ${shortDate(payday)} instead of ${shortDate(pending[0].nextTransferDate)}. Your lowest balance would be about ${eur(forecast.lowestProjected + total)}.`,
      amount: total,
      tradeOff: "Your goals receive the same amount, about three weeks later. Projected goal dates do not change meaningfully.",
      recommended: true,
    });
  }
  actions.push({
    id: "reminder:low-balance",
    kind: "reminder",
    label: `Alert me if my balance drops below ${eur(state.profile.safetyBuffer)}`,
    description: "A one-time alert on your preferred channel, no money moves.",
  });
  actions.push({
    id: "keep:cashflow",
    kind: "keep",
    label: "Keep everything as planned",
    description: `Your balance stays positive (lowest about ${eur(forecast.lowestProjected)}) and your emergency fund is untouched.`,
  });
  return actions;
}

export function energyActions(): ActionOption[] {
  return [
    {
      id: "reminder:energy-contract",
      kind: "reminder",
      label: "Remind me to review my energy contract",
      description: "We set a reminder for next week with your usage summary. Comparing offers is your choice.",
      recommended: true,
    },
    {
      id: "info:budget-utilities",
      kind: "info",
      label: "Update my monthly utilities estimate to €164",
      description: "Future forecasts will use the new amount so there are no surprises.",
    },
  ];
}

export function milestoneActions(goal: Goal): ActionOption[] {
  return [
    {
      id: `info:progress:${goal.id}`,
      kind: "info",
      label: "See my progress",
      description: `Open your ${goal.name.toLowerCase()} journey.`,
    },
  ];
}

export function projectedPhrase(before: string | null, after: string | null): string {
  return `${monthYear(before)} → ${monthYear(after)}`;
}
