import { daysBetween, weekdayName } from "@/lib/utils/dates";
import { eur, shortDate } from "@/lib/utils/format";
import { cashflowActions } from "../nba";
import { affordability } from "../simulate";
import { cashflowForecast } from "../signals";
import { base, type Detector } from "./shared";

export const cashflowRisk: Detector = (state) => {
  const f = cashflowForecast(state);
  const buffer = state.profile.safetyBuffer;
  if (f.lowestProjected >= buffer) return [];
  const big = state.upcoming
    .filter((u) => u.dueDate > state.today && u.dueDate < f.nextSalaryDate)
    .sort((a, b) => b.amount - a.amount)[0];
  if (!big) return [];
  const confirmed = big.certainty === "confirmed";
  const days = daysBetween(state.today, big.dueDate);
  const shortfall = buffer - f.lowestProjected;
  const what = big.category === "insurance" ? "annual insurance payment" : "payment";
  return [{
    ...base(state),
    key: `cashflow_risk:${big.id}`,
    type: "cashflow_risk",
    tone: "risk",
    topic: "bills",
    title: `Your ${eur(big.amount)} ${what} is expected ${weekdayName(big.dueDate)}`,
    summary: `After this and your other payments, your balance is projected to fall to about ${eur(f.lowestProjected)} before payday - below the ${eur(buffer)} safety balance you chose.`,
    event: confirmed ? `Payment request received: ${eur(big.amount)} due ${big.dueDate}` : `Predicted annual payment: ~${eur(big.amount)} around ${big.dueDate}`,
    signals: [
      { id: "payment", label: "Upcoming payment", value: `${eur(big.amount)} on ${big.dueDate}`, customerText: `${big.merchant}: ${eur(big.amount)} due on ${weekdayName(big.dueDate)} ${shortDate(big.dueDate)}.` },
      { id: "low", label: "Projected low", value: eur(f.lowestProjected), customerText: `Your projected lowest balance before payday is ${eur(f.lowestProjected)}.` },
      { id: "usual", label: "Usual low point", value: eur(f.usualLowPoint), customerText: `Normally your balance before payday is around ${eur(f.usualLowPoint)}.` },
      { id: "buffer", label: "Safety balance", value: eur(buffer), customerText: `You asked us to help you keep at least ${eur(buffer)}.` },
    ],
    context: ["Customer-defined safety balance", confirmed ? "Payment confirmed by insurer" : "Timing inferred from last year's payment"],
    estimatedImpact: `${eur(shortfall)} below your safety balance`,
    impactEuro: shortfall,
    nextBestAction: "Offer to shift goal transfers until after payday",
    whyNow: confirmed ? `Confirmed payment due in ${days} day${days === 1 ? "" : "s"}` : "Timing still uncertain - monitor, don't interrupt yet",
    actions: cashflowActions(state, f),
    inputs: {
      impact: Math.min(100, 50 + shortfall / 10),
      // Unconfirmed timing: watch quietly until the payment request arrives.
      urgency: confirmed ? (days <= 3 ? 95 : 75) : 30,
      goalRelevance: 70,
      confidence: confirmed ? 95 : 25,
    },
  }];
};

export const contextualDecision: Detector = (state) => {
  const d = state.lastDecision;
  if (!d) return [];
  const r = affordability(state, d.amount, d.purpose);
  const main = r.options[0];
  return [{
    ...base(state),
    key: `contextual_decision:${d.amount}`,
    type: "contextual_decision",
    tone: "info",
    topic: "goals",
    title: `Decision support: ${eur(d.amount)} ${d.purpose}`,
    summary: main.noImpact ? "Affordable without affecting your goals." : `Would delay your ${r.primaryGoal.name.toLowerCase()} by about ${main.delayWeeks} weeks.`,
    event: `Customer asked: "${d.question}"`,
    signals: r.signals.map((s, i) => {
      const [label, ...rest] = s.split(":");
      return { id: `s${i}`, label, value: rest.join(":").trim(), customerText: s };
    }),
    context: [`${r.primaryGoal.name} is the primary long-term goal`],
    estimatedImpact: main.noImpact ? "No goal impact" : `${main.delayWeeks} weeks delay`,
    nextBestAction: "Show trade-off options against the goal timeline",
    whyNow: "Customer explicitly asked - answered in the conversation",
    actions: [],
    relatedGoalId: r.primaryGoal.id,
    inputs: { impact: 70, urgency: 100, goalRelevance: 90, confidence: 90 },
  }];
};
