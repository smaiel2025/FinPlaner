/**
 * Financial Health Score - a POC/demo progress indicator, NOT an official KBC
 * metric or a credit score. Every point is traceable to one of five factors.
 */
import type { CustomerState } from "@/lib/types/domain";
import type { HealthFactor, HealthScore } from "@/lib/types/intelligence";
import { monthsBetween, recentMonthKeys } from "@/lib/utils/dates";
import { essentialMonthly } from "./profile";
import { DISCRETIONARY, analysisMonth, avg, categorySum, incomeByMonth, monthlyTotals } from "./signals";

const clamp = (x: number) => Math.max(0, Math.min(100, x));

const WEIGHTS: Record<HealthFactor["id"], number> = { buffer: 0.4, savings: 0.1, debt: 0.1, stability: 0.15, goals: 0.25 };

const LABELS: Record<HealthFactor["id"], string> = {
  buffer: "Cash buffer",
  savings: "Savings rate",
  debt: "Debt burden",
  stability: "Spending stability",
  goals: "Goal progress",
};

function goalAmountAt(state: CustomerState, goalId: string, month: string): number {
  const goal = state.goals.find((g) => g.id === goalId)!;
  const snaps = goal.history.filter((h) => h.month <= month);
  return snaps.length ? snaps[snaps.length - 1].amount : 0;
}

/** Raw factor scores for a given month-end. */
export function factorScores(state: CustomerState, month: string) {
  const totals = monthlyTotals(state);
  const income = incomeByMonth(state)[month] ?? state.profile.monthlyNetIncome;
  const monthEnd = `${month}-28`;

  const emergency = state.goals.find((g) => g.type === "emergency");
  const essential = essentialMonthly(state, month);
  const bufferMonths = emergency ? goalAmountAt(state, emergency.id, month) / essential : 0;

  const spent = Object.entries(totals[month] ?? {})
    .filter(([c]) => c !== "savings_transfer")
    .reduce((s, [, v]) => s + (v ?? 0), 0);
  const keptRate = income ? (income - spent) / income : 0;

  const debtPayments = state.loans.reduce((s, l) => s + l.monthlyPayment, 0);
  const monthsSince = Math.max(0, Math.round(monthsBetween(monthEnd, state.today)));
  const remaining = state.loans.reduce((s, l) => s + l.remaining + l.monthlyPayment * monthsSince, 0);
  const principal = state.loans.reduce((s, l) => s + l.principal, 0) || 1;

  const window = recentMonthKeys(`${month}-01`, 3).map((m) => categorySum(totals[m], DISCRETIONARY));
  const mean = avg(window);
  const sd = Math.sqrt(avg(window.map((x) => (x - mean) ** 2)));

  const goalRatios = state.goals.map((g) => {
    const amount = goalAmountAt(state, g.id, month);
    const required = (g.targetAmount - amount) / Math.max(1, monthsBetween(monthEnd, g.targetDate));
    return required <= 0 ? 1 : Math.min(1, g.monthlyContribution / required);
  });

  return {
    buffer: { score: clamp((bufferMonths / 6) * 100), detail: `${bufferMonths.toFixed(1)} months of essential expenses in your emergency fund` },
    savings: { score: clamp((keptRate / 0.5) * 100), detail: `You kept ${Math.round(keptRate * 100)}% of your income after spending this month` },
    debt: {
      score: clamp(100 - (debtPayments / income) * 300 - (remaining / principal) * 10),
      detail: remaining > 0 ? `€${Math.round(remaining).toLocaleString("en-IE")} left on your loan (${Math.round((debtPayments / income) * 100)}% of income per month)` : "No outstanding loans",
    },
    stability: { score: clamp(100 - (mean ? sd / mean : 0) * 100), detail: `Flexible spending varied ${Math.round((mean ? sd / mean : 0) * 100)}% over the last 3 months` },
    goals: { score: clamp(avg(goalRatios) * 100), detail: `Contributions cover ${Math.round(avg(goalRatios) * 100)}% of what your goals need` },
  };
}

function weighted(f: ReturnType<typeof factorScores>): number {
  return Math.round((Object.keys(WEIGHTS) as HealthFactor["id"][]).reduce((s, id) => s + f[id].score * WEIGHTS[id], 0));
}

const UP: Record<HealthFactor["id"], string> = {
  buffer: "your emergency buffer increased",
  savings: "you kept more of your income than last month",
  debt: "your loan balance went down",
  stability: "your spending was more predictable",
  goals: "your goal contributions are closer to what your plans need",
};
const DOWN: Record<HealthFactor["id"], string> = {
  buffer: "your emergency buffer decreased",
  savings: "you kept less of your income than last month",
  debt: "your debt position increased",
  stability: "flexible spending varied more than usual",
  goals: "goal contributions fell behind what your plans need",
};

export function label(score: number): HealthScore["label"] {
  if (score >= 80) return "Strong";
  if (score >= 65) return "Stable";
  if (score >= 50) return "Building";
  return "Needs attention";
}

export function computeHealthScore(state: CustomerState): HealthScore {
  const month = analysisMonth(state);
  const months = recentMonthKeys(`${month}-01`, 6);
  const now = factorScores(state, month);
  const prev = factorScores(state, months[months.length - 2]);

  const factors: HealthFactor[] = (Object.keys(WEIGHTS) as HealthFactor["id"][]).map((id) => ({
    id,
    label: LABELS[id],
    weight: WEIGHTS[id],
    score: Math.round(now[id].score),
    previousScore: Math.round(prev[id].score),
    detail: now[id].detail,
  }));

  const score = weighted(now);
  const previous = weighted(prev);
  const deltas = factors
    .map((f) => ({ f, d: (f.score - f.previousScore) * f.weight }))
    .filter((x) => Math.abs(x.d) >= 0.4)
    .sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
  const reasons = deltas.map(({ f, d }) => (d > 0 ? UP[f.id] : DOWN[f.id]));

  return {
    score,
    previous,
    change: score - previous,
    label: label(score),
    factors,
    reasons: reasons.length ? reasons : ["your financial position stayed broadly the same"],
    history: months.map((m) => ({ month: m, score: weighted(factorScores(state, m)) })),
  };
}
