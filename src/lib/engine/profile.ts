/**
 * Customer Financial Profile: a compact, explainable summary of the customer's
 * financial position. This is the reusable "customer understanding" object.
 */
import type { CustomerState } from "@/lib/types/domain";
import type { FinancialProfile } from "@/lib/types/intelligence";
import { recentMonthKeys } from "@/lib/utils/dates";
import {
  DISCRETIONARY,
  ESSENTIAL,
  analysisMonth,
  avg,
  categorySum,
  incomeByMonth,
  isOneOff,
  monthlyTotals,
  round,
  salaryChange,
  spendingComparison,
} from "./signals";

export function essentialMonthly(state: CustomerState, month = analysisMonth(state)): number {
  const totals = monthlyTotals(state, true);
  const months = recentMonthKeys(`${month}-01`, 3);
  return avg(months.map((m) => categorySum(totals[m], ESSENTIAL)));
}

export function emergencyFund(state: CustomerState): number {
  return state.goals.find((g) => g.type === "emergency")?.currentAmount ?? 0;
}

export function buildFinancialProfile(state: CustomerState): FinancialProfile {
  const month = analysisMonth(state);
  const totals = monthlyTotals(state);
  const income = incomeByMonth(state);
  const months = recentMonthKeys(`${month}-01`, 6);

  const current = state.accounts.find((a) => a.type === "current")!.balance;
  const savings = state.accounts.filter((a) => a.type === "savings").reduce((s, a) => s + a.balance, 0);
  const investments = state.accounts.filter((a) => a.type === "investment").reduce((s, a) => s + a.balance, 0);
  const debt = state.loans.reduce((s, l) => s + l.remaining, 0);
  const debtPayments = state.loans.reduce((s, l) => s + l.monthlyPayment, 0);

  const essential = essentialMonthly(state);
  const discretionary = avg(recentMonthKeys(`${month}-01`, 3).map((m) => categorySum(monthlyTotals(state, true)[m], DISCRETIONARY)));
  const monthIncome = income[month] ?? state.profile.monthlyNetIncome;
  const saved = totals[month]?.savings_transfer ?? 0;

  const series = months.map((m) => ({
    month: m,
    essential: round(categorySum(totals[m], ESSENTIAL)),
    discretionary: round(categorySum(totals[m], DISCRETIONARY)),
    saved: round(totals[m]?.savings_transfer ?? 0),
  }));

  const behaviorChanges: string[] = [];
  const salary = salaryChange(state);
  if (salary.latest !== salary.previous) {
    behaviorChanges.push(`Salary increased from €${salary.previous.toLocaleString("en-IE")} to €${salary.latest.toLocaleString("en-IE")} (since ${salary.since.slice(0, 7)}).`);
  }
  for (const c of spendingComparison(state)) {
    if (c.average > 30 && Math.abs(c.changePct) >= 0.25) {
      behaviorChanges.push(`${c.category[0].toUpperCase()}${c.category.slice(1)} ${c.changePct > 0 ? "up" : "down"} ${Math.round(Math.abs(c.changePct) * 100)}% vs 6-month average.`);
    }
  }
  const oneOffs = state.transactions.filter((t) => months.includes(t.date.slice(0, 7)) && isOneOff(t, state.transactions));
  for (const t of oneOffs) behaviorChanges.push(`One-off purchase: ${t.merchant} €${Math.round(-t.amount)} (${t.date}).`);

  return {
    netWorth: round(current + savings + investments - debt),
    liquidity: round(current + savings),
    monthlyIncome: monthIncome,
    essentialMonthly: round(essential),
    discretionaryMonthly: round(discretionary),
    savingsRate: monthIncome ? saved / monthIncome : 0,
    debtRemaining: debt,
    debtToIncome: monthIncome ? debtPayments / monthIncome : 0,
    emergencyMonths: Math.round((emergencyFund(state) / essential) * 10) / 10,
    spending: spendingComparison(state),
    monthlySpendingSeries: series,
    behaviorChanges,
  };
}
