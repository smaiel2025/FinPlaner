/**
 * Customer-approved actions. Nothing here runs without an explicit approval
 * call from the UI; execution is simulated against the mock services.
 */
import { analyzeCustomer } from "@/lib/engine";
import { projectAll } from "@/lib/engine/goals";
import type { FeedbackRecord } from "@/lib/types/domain";
import type { GoalProjection } from "@/lib/types/intelligence";
import { eur, monthYear, shortDate } from "@/lib/utils/format";
import { goalService } from "./mock";
import { getState, mutate, nextId } from "./store";

const CUSTOMER = "cust-sophie-001";

export interface ApprovalResult {
  changes: string[];
  before: GoalProjection[];
  after: GoalProjection[];
}

export function approveActions(opportunityKey: string, actionIds: string[]): ApprovalResult {
  const ctx = analyzeCustomer(getState());
  const opp = ctx.opportunities.find((o) => o.key === opportunityKey);
  if (!opp) throw new Error("This recommendation is no longer available");
  const selected = opp.actions.filter((a) => actionIds.includes(a.id));
  if (!selected.length) throw new Error("Select at least one action to approve");

  const before = projectAll(getState());
  const changes: string[] = [];
  const today = getState().today;

  for (const action of selected) {
    switch (action.kind) {
      case "cancel_subscription": {
        const recurringId = action.id.split(":")[1];
        mutate((s) => {
          const r = s.recurring.find((x) => x.id === recurringId);
          if (r) r.status = "cancel_requested";
          const g = s.goals.find((x) => x.id === action.goalId);
          if (g && action.amount) g.monthlyContribution = Math.round((g.monthlyContribution + action.amount) * 100) / 100;
        });
        changes.push(`Cancellation request prepared; ${eur(action.amount ?? 0, true)}/month redirected to your goal`);
        break;
      }
      case "adjust_contribution":
        mutate((s) => {
          const g = s.goals.find((x) => x.id === action.goalId);
          if (g && action.amount) g.monthlyContribution += action.amount;
        });
        changes.push(`Standing order increased by ${eur(action.amount ?? 0)}/month from the next transfer`);
        break;
      case "transfer":
        if (action.goalId && action.amount) goalService.contribute(CUSTOMER, action.goalId, action.amount, today);
        changes.push(`${eur(action.amount ?? 0)} moved to your goal`);
        break;
      case "reschedule_transfer": {
        const [, goalIds, date] = action.id.split(":");
        mutate((s) => {
          for (const id of goalIds.split("+")) {
            const g = s.goals.find((x) => x.id === id);
            if (g) g.nextTransferDate = date;
          }
        });
        changes.push(`This month's goal transfers moved to ${shortDate(date)}`);
        break;
      }
      default:
        changes.push(action.kind === "keep" ? "No changes - plan kept as it is" : `${action.label} - noted`);
    }
  }

  mutate((s) => {
    s.feedback.push({ key: opportunityKey, outcome: "accepted", date: s.today });
    s.actions.push({ id: nextId("act"), date: s.today, title: opp.title, changes, goalId: opp.relatedGoalId });
    if (opp.type === "milestone") s.acknowledgedMilestones.push(opportunityKey.replace("milestone:", ""));
  });

  return { changes, before, after: projectAll(getState()) };
}

export function recordFeedback(key: string, outcome: FeedbackRecord["outcome"]): void {
  mutate((s) => {
    s.feedback.push({ key, outcome, date: s.today });
    if (outcome === "never" && !s.preferences.neverRecommend.includes(key)) s.preferences.neverRecommend.push(key);
    if (key.startsWith("milestone:")) s.acknowledgedMilestones.push(key.replace("milestone:", ""));
  });
}

export function allowAgain(key: string): void {
  mutate((s) => {
    s.preferences.neverRecommend = s.preferences.neverRecommend.filter((k) => k !== key);
    s.feedback = s.feedback.filter((f) => f.key !== key);
  });
}

export function resolveFact(factId: string, apply: boolean): string {
  let result = "";
  mutate((s) => {
    const fact = s.memory.find((m) => m.id === factId);
    if (!fact) throw new Error("Unknown memory item");
    if (apply && fact.proposal) {
      const goal = s.goals.find((g) => g.id === fact.proposal!.goalId);
      if (goal) goal.targetDate = fact.proposal.targetDate;
      fact.status = "applied";
      result = `Goal updated: target date ${monthYear(fact.proposal.targetDate)}`;
    } else {
      fact.status = "noted";
      result = "Noted - your goal stays as it is";
    }
  });
  return result;
}

export function forgetFact(factId: string): void {
  mutate((s) => void (s.memory = s.memory.filter((m) => m.id !== factId)));
}
