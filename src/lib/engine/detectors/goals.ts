import type { CustomerState } from "@/lib/types/domain";
import type { Opportunity } from "@/lib/types/intelligence";
import { eur, longDate, monthYear, roundTo } from "@/lib/utils/format";
import { goalRecoveryActions } from "../nba";
import { primaryGoal } from "../simulate";
import { cashflowForecast, salaryChange, unusedSubscriptions } from "../signals";
import { base, type Detector } from "./shared";

/** Surplus we suggest redirecting: ~60% of a typical month's unallocated money, keeping the rest flexible. */
export function surplusRedirect(state: CustomerState): number {
  const surplus = cashflowForecast(state).monthlySurplus;
  return surplus >= 150 ? roundTo(surplus * 0.6, 10) : 0;
}

export const goalDeviation: Detector = (state, projections) => {
  const goal = primaryGoal(state);
  const p = projections.find((x) => x.goal.id === goal.id);
  if (!p || p.monthsAheadOfTarget > -1) return [];
  const behind = Math.round(-p.monthsAheadOfTarget);
  const unused = unusedSubscriptions(state)[0]?.recurring;
  const redirect = surplusRedirect(state);
  const surplus = cashflowForecast(state).monthlySurplus;
  const actions = goalRecoveryActions(state, goal, unused, redirect);
  const totalDelta = actions.reduce((s, a) => s + (a.amount ?? 0), 0);
  const travel = projections.find((x) => x.goal.type === "travel");
  return [{
    ...base(state),
    key: `goal_deviation:${goal.id}`,
    type: "goal_deviation",
    tone: "opportunity",
    topic: "goals",
    title: `Your ${goal.name.toLowerCase()} has slipped by about ${behind} month${behind === 1 ? "" : "s"}`,
    summary: `At ${eur(goal.monthlyContribution)}/month you would reach it in ${monthYear(p.projectedDate)} instead of ${monthYear(goal.targetDate)}. ${actions.length === 2 ? "Two changes" : "A small change"} could put you back on track without touching your emergency fund.`,
    event: "Monthly goal projection recalculated",
    signals: [
      { id: "contrib", label: "Current contribution", value: `${eur(goal.monthlyContribution)}/mo`, customerText: `You currently transfer ${eur(goal.monthlyContribution)} a month to this goal.` },
      { id: "required", label: "Needed to stay on track", value: `${eur(p.requiredMonthly)}/mo`, customerText: `Reaching ${eur(goal.targetAmount)} by ${monthYear(goal.targetDate)} needs about ${eur(p.requiredMonthly)} a month.` },
      { id: "projected", label: "Projected date", value: monthYear(p.projectedDate), customerText: `At today's pace you would get there in ${monthYear(p.projectedDate)}.` },
      ...(unused ? [{ id: "unused", label: "Unused subscription", value: `${unused.merchant} ${eur(unused.amount, true)}`, customerText: `${unused.merchant} has not been used since ${longDate(unused.lastUsed!)}.` }] : []),
      ...(redirect ? [{ id: "surplus", label: "Typical unallocated surplus", value: `${eur(surplus)}/mo`, customerText: `Since your salary increase, about ${eur(surplus)} typically stays unallocated each month.` }] : []),
    ],
    context: [`${goal.name} is a ${goal.priority}-priority goal`, travel?.onTrack ? "Japan trip still on track" : "Japan trip needs attention", "Emergency fund must stay untouched"],
    estimatedImpact: `+${eur(totalDelta)}/month toward your ${goal.name.toLowerCase()}`,
    impactEuro: totalDelta * 12,
    nextBestAction: "Suggest two low-effort changes that restore the goal timeline",
    whyNow: "High-priority goal drifted beyond one month; changes are easiest to make early",
    actions,
    relatedGoalId: goal.id,
    inputs: { impact: Math.min(100, 60 + behind * 12), urgency: 55, goalRelevance: goal.priority === "high" ? 95 : 70, confidence: 85 },
  }];
};

export const liquidityAndSurplus: Detector = (state) => {
  const f = cashflowForecast(state);
  const buffer = state.profile.safetyBuffer;
  const excess = f.currentBalance - f.usualLowPoint - 1000;
  const out: Opportunity[] = [];
  if (excess > 500) {
    const committed = f.lowestProjected < buffer + 500;
    out.push({
      ...base(state),
      key: "excess_liquidity",
      type: "excess_liquidity",
      tone: "opportunity",
      topic: "saving",
      title: `${eur(roundTo(excess, 50))} more than usual in your current account`,
      summary: committed ? "Most of this is already needed for upcoming payments before payday." : "You could put part of this to work toward your goals.",
      event: `Current account balance: ${eur(f.currentBalance)}`,
      signals: [
        { id: "balance", label: "Balance", value: eur(f.currentBalance), customerText: `Your balance is ${eur(f.currentBalance)}.` },
        { id: "low", label: "Projected low before payday", value: eur(f.lowestProjected), customerText: `After upcoming payments it is projected to drop to ${eur(f.lowestProjected)}.` },
      ],
      context: [`Safety balance ${eur(buffer)}`],
      estimatedImpact: committed ? "None - cash is already committed" : `${eur(excess)} idle cash`,
      nextBestAction: committed ? "Do not suggest moving money" : "Suggest allocating surplus to goals",
      whyNow: committed ? "Balance is needed for upcoming obligations" : "Idle cash above buffer",
      actions: [],
      inputs: committed ? { impact: 20, urgency: 20, goalRelevance: 50, confidence: 30 } : { impact: 65, urgency: 40, goalRelevance: 80, confidence: 75 },
    });
  }
  const salary = salaryChange(state);
  if (salary.latest > salary.previous && f.monthlySurplus >= 150) {
    out.push({
      ...base(state),
      key: "savings_opportunity:salary",
      type: "savings_opportunity",
      tone: "opportunity",
      topic: "saving",
      title: `About ${eur(f.monthlySurplus)} stays unallocated each month since your raise`,
      summary: `Your salary rose from ${eur(salary.previous)} to ${eur(salary.latest)}, but goal transfers did not change.`,
      event: "Salary increase detected",
      signals: [{ id: "salary", label: "Salary", value: `${eur(salary.previous)} → ${eur(salary.latest)}`, customerText: `Your salary went from ${eur(salary.previous)} to ${eur(salary.latest)}.` }],
      context: ["Goal transfers unchanged since raise"],
      estimatedImpact: `${eur(f.monthlySurplus)}/month available`,
      nextBestAction: "Redirect part of surplus to a goal",
      whyNow: "Recurring surplus pattern confirmed over several months",
      actions: [],
      bundledInto: `goal_deviation:${primaryGoal(state).id}`,
      inputs: { impact: 60, urgency: 30, goalRelevance: 85, confidence: 70 },
    });
  }
  return out;
};
