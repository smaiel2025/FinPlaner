/**
 * Progress & milestone engine. Recognition is based on real-world financial
 * outcomes only - never on app usage. Comparisons are always with the customer's
 * own history.
 */
import type { CustomerState } from "@/lib/types/domain";
import type { Achievement, GoalProjection, MilestoneEvent, PersonalBest, Streak } from "@/lib/types/intelligence";
import { monthLabel } from "@/lib/utils/format";
import { recentMonthKeys } from "@/lib/utils/dates";
import { essentialMonthly } from "./profile";
import { DISCRETIONARY, analysisMonth, balanceOn, categorySum, monthlyTotals, salaryDay } from "./signals";

export function milestoneKey(goalId: string, amount: number) {
  return `${goalId}:${amount}`;
}

function milestoneLabel(goalType: string, amount: number, target: number, index: number, count: number) {
  if (amount >= target) return "Goal reached";
  if (goalType === "emergency") return `${Math.round(((index + 1) / count) * 100)}% funded`;
  return `€${(amount / 1000).toFixed(0)}K saved`;
}

/** All milestones reached across goals, with the month they were reached. */
export function reachedMilestones(state: CustomerState): MilestoneEvent[] {
  const events: MilestoneEvent[] = [];
  for (const g of state.goals) {
    g.milestoneAmounts.forEach((amount, i) => {
      const hit = g.history.find((h) => h.amount >= amount);
      if (!hit && g.currentAmount < amount) return;
      const label = milestoneLabel(g.type, amount, g.targetAmount, i, g.milestoneAmounts.length);
      events.push({
        key: milestoneKey(g.id, amount),
        goalId: g.id,
        label,
        amount,
        reachedOn: hit ? `${hit.month}-01` : state.today,
        message: `${g.name}: ${label}`,
      });
    });
  }
  return events;
}

/** Milestones reached but not yet acknowledged (candidates for recognition). */
export function newMilestones(state: CustomerState): MilestoneEvent[] {
  return reachedMilestones(state).filter((m) => !state.acknowledgedMilestones.includes(m.key));
}

/** Consecutive months (most recent first) for which `predicate` holds. */
function streakLength(months: string[], predicate: (m: string) => boolean): number {
  let n = 0;
  for (let i = months.length - 1; i >= 0 && predicate(months[i]); i--) n++;
  return n;
}

export function computeStreaks(state: CustomerState): Streak[] {
  const month = analysisMonth(state);
  const months = recentMonthKeys(`${month}-01`, 7);
  const totals = monthlyTotals(state);
  const day = salaryDay(state);
  const buffer = state.profile.safetyBuffer;

  const bufferMonths = streakLength(months, (m) => balanceOn(state, `${m}-${String(day - 1).padStart(2, "0")}`) >= buffer);
  const plannedSaving = state.goals.reduce((s, g) => s + g.monthlyContribution, 0);
  const savingMonths = streakLength(months, (m) => (totals[m]?.savings_transfer ?? 0) >= plannedSaving - 1);
  const subsBase = categorySum(totals[months[0]], ["subscriptions"]);
  const subsMonths = streakLength(months, (m) => categorySum(totals[m], ["subscriptions"]) <= subsBase + 5);

  return [
    { id: "buffer", label: `${bufferMonths} months keeping your €${buffer.toLocaleString("en-IE")} safety balance`, months: bufferMonths, description: "Your lowest balance before payday stayed at or above the level you chose." },
    { id: "saving", label: `${savingMonths} months meeting your planned savings`, months: savingMonths, description: "All planned goal transfers went through as scheduled." },
    { id: "recurring", label: `${subsMonths} months without new recurring costs`, months: subsMonths, description: "No new subscriptions were added to your monthly costs." },
  ];
}

export function computeAchievements(state: CustomerState, projections: GoalProjection[], streaks: Streak[]): Achievement[] {
  const emergency = projections.find((p) => p.goal.type === "emergency");
  const essential = essentialMonthly(state);
  const emergencyMonths = emergency ? emergency.goal.currentAmount / essential : 0;
  const readySince = emergency?.goal.history.find((h) => h.amount / essential >= 3)?.month;
  const loan = state.loans[0];
  const repaid = loan ? 1 - loan.remaining / loan.principal : 0;
  const bufferStreak = streaks.find((s) => s.id === "buffer")?.months ?? 0;
  const savingStreak = streaks.find((s) => s.id === "saving")?.months ?? 0;
  const cancelled = state.recurring.some((r) => r.status === "cancel_requested");
  const completed = projections.some((p) => p.progress >= 1);
  const ahead = projections.some((p) => p.monthsAheadOfTarget >= 1 && p.milestonesReached.length > 0);

  return [
    { id: "emergency-ready", title: "Emergency Ready", description: "Built an emergency buffer equal to 3 months of essential expenses.", earned: emergencyMonths >= 3, earnedOn: emergencyMonths >= 3 ? readySince : undefined, progressText: `${emergencyMonths.toFixed(1)} months covered` },
    { id: "goal-momentum", title: "Goal Momentum", description: "Stayed on track with a financial goal for 3 consecutive months.", earned: savingStreak >= 3, progressText: `${savingStreak} consecutive months` },
    { id: "debt-milestone", title: "Debt Milestone", description: "Repaid 50% of a selected loan.", earned: repaid >= 0.5, progressText: `${Math.round(repaid * 100)}% repaid` },
    { id: "smart-buffer", title: "Smart Buffer", description: "Maintained the chosen safety balance for 6 months.", earned: bufferStreak >= 6, progressText: `${Math.min(bufferStreak, 6)} of 6 months` },
    { id: "subscription-cleanup", title: "Subscription Cleanup", description: "Reduced recurring monthly expenses.", earned: cancelled, progressText: cancelled ? "Recurring costs reduced" : "Not yet" },
    { id: "ahead-of-plan", title: "Ahead of Plan", description: "Reached a major financial milestone earlier than projected.", earned: ahead, progressText: ahead ? "Ahead of your original plan" : "Not yet" },
    { id: "first-goal", title: "First Goal Completed", description: "Successfully completed a personal savings goal.", earned: completed, progressText: completed ? "Completed" : "In progress" },
  ];
}

export function computePersonalBests(state: CustomerState): PersonalBest[] {
  const month = analysisMonth(state);
  const months = recentMonthKeys(`${month}-01`, 7);
  const totals = monthlyTotals(state);
  const bests: PersonalBest[] = [];

  const emergency = state.goals.find((g) => g.type === "emergency");
  if (emergency) {
    const max = Math.max(...emergency.history.map((h) => h.amount));
    if (emergency.currentAmount >= max) bests.push({ id: "buffer-high", label: "Emergency buffer at its highest level this year", detail: `€${emergency.currentAmount.toLocaleString("en-IE")} set aside for unexpected costs.` });
  }
  const disc = months.map((m) => ({ m, v: categorySum(totals[m], DISCRETIONARY) }));
  const latest = disc[disc.length - 1];
  const peak = disc.reduce((a, b) => (b.v > a.v ? b : a));
  if (peak.m !== latest.m && latest.v < peak.v * 0.7) {
    bests.push({ id: "spending-reset", label: "Flexible spending back to normal", detail: `${monthLabel(latest.m)} flexible spending was €${Math.round(peak.v - latest.v)} lower than your ${monthLabel(peak.m)} peak.` });
  }
  const house = state.goals.find((g) => g.type === "house");
  if (house) bests.push({ id: "house-balance", label: "Highest house deposit balance so far", detail: `€${house.currentAmount.toLocaleString("en-IE")} saved toward your home.` });
  return bests;
}
