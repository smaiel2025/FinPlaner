import type { Opportunity } from "@/lib/types/intelligence";
import { eur, monthYear, pct } from "@/lib/utils/format";
import { milestoneKey, newMilestones } from "../milestones";
import { milestoneActions } from "../nba";
import { essentialMonthly } from "../profile";
import { base, type Detector } from "./shared";

export const milestones: Detector = (state, projections) =>
  newMilestones(state).map((m): Opportunity => {
    const p = projections.find((x) => x.goal.id === m.goalId)!;
    const g = p.goal;
    const months = g.type === "emergency" ? (g.currentAmount / essentialMonthly(state)).toFixed(1) : null;
    const remainingMonths = g.monthlyContribution ? Math.ceil(p.remaining / g.monthlyContribution) : null;
    return {
      ...base(state),
      key: `milestone:${milestoneKey(g.id, m.amount)}`,
      type: "milestone",
      tone: "positive",
      topic: "milestones",
      title: `Milestone reached: ${g.name} ${m.label.toLowerCase()}`,
      summary: `${eur(g.currentAmount)} / ${eur(g.targetAmount)}.${months ? ` You now have about ${months} months of essential expenses covered.` : ""}${remainingMonths ? ` At your current pace you complete this goal in about ${remainingMonths} months.` : ""}`,
      event: `${g.name} contribution: ${eur(g.monthlyContribution)}`,
      signals: [
        { id: "crossed", label: "Milestone", value: m.label, customerText: `Your ${g.name.toLowerCase()} crossed ${eur(m.amount)}.` },
        { id: "progress", label: "Progress", value: pct(p.progress), customerText: `You are ${pct(p.progress)} of the way there.` },
      ],
      context: [`${g.name} is a ${g.priority}-priority goal`],
      estimatedImpact: `${Math.round(p.progress * 100)}% complete`,
      nextBestAction: "Show subtle milestone recognition - no product offer",
      whyNow: "Meaningful progress on a major goal milestone",
      actions: milestoneActions(g),
      relatedGoalId: g.id,
      inputs: { impact: 55, urgency: 50, goalRelevance: g.priority === "high" ? 90 : 65, confidence: 100 },
    };
  });

export const positiveBehavior: Detector = (state) => {
  const loan = state.loans[0];
  if (!loan || loan.remaining / loan.principal > 0.5) return [];
  const repaid = 1 - loan.remaining / loan.principal;
  return [{
    ...base(state),
    key: `positive_behavior:${loan.id}:50`,
    type: "positive_behavior",
    tone: "positive",
    topic: "milestones",
    title: "More than half of your furniture loan is repaid",
    summary: `${eur(loan.principal - loan.remaining)} of ${eur(loan.principal)} repaid. It will be fully repaid by ${monthYear(loan.endDate)}.`,
    event: `Loan instalment: ${eur(loan.monthlyPayment)}`,
    signals: [{ id: "repaid", label: "Repaid", value: pct(repaid), customerText: `You have repaid ${pct(repaid)} of the loan.` }],
    context: ["Recognised quietly in Your Progress"],
    estimatedImpact: "Positive reinforcement",
    nextBestAction: "Show in Your Progress only",
    whyNow: "Not worth an interruption - shown quietly in the progress view",
    actions: [],
    inputs: { impact: 40, urgency: 20, goalRelevance: 50, confidence: 100 },
  }];
};
