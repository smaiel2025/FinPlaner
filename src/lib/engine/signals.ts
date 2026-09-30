/**
 * Signal engine: turns raw transactions into comparable, explainable metrics.
 * Pure functions only - safe to run per event for millions of customers.
 */
import type { Category, CustomerState, ISODate, RecurringPayment, Transaction } from "@/lib/types/domain";
import type { CashflowForecast, SpendingCategory } from "@/lib/types/intelligence";
import { addDays, addMonths, daysBetween, monthKey, parseDate, recentMonthKeys, toISO } from "@/lib/utils/dates";

export const ESSENTIAL: Category[] = ["rent", "utilities", "telecom", "insurance", "loan", "groceries", "transport", "health"];
export const DISCRETIONARY: Category[] = ["restaurants", "shopping", "entertainment", "subscriptions"];
const VARIABLE: Category[] = ["groceries", "restaurants", "shopping", "entertainment", "transport", "health"];

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const avg = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);
export const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
export const round = (x: number, step = 1) => Math.round(x / step) * step;

/** A transaction is a one-off if it is far above the typical size for its category. */
export function isOneOff(tx: Transaction, all: Transaction[]): boolean {
  if (tx.amount >= 0 || tx.recurringId || tx.category === "savings_transfer") return false;
  const peers = all.filter((t) => t.category === tx.category && t.amount < 0).map((t) => -t.amount);
  return -tx.amount > Math.max(200, median(peers) * 4);
}

/** Outflows per month and category (positive numbers). Annual payments count in their month. */
export function monthlyTotals(state: CustomerState, excludeOneOffs = false) {
  const totals: Record<string, Partial<Record<Category, number>>> = {};
  for (const tx of state.transactions) {
    if (tx.amount >= 0) continue;
    if (excludeOneOffs && isOneOff(tx, state.transactions)) continue;
    const m = monthKey(tx.date);
    totals[m] ??= {};
    totals[m][tx.category] = (totals[m][tx.category] ?? 0) + -tx.amount;
  }
  return totals;
}

export function incomeByMonth(state: CustomerState): Record<string, number> {
  const out: Record<string, number> = {};
  for (const tx of state.transactions) if (tx.amount > 0) out[monthKey(tx.date)] = (out[monthKey(tx.date)] ?? 0) + tx.amount;
  return out;
}

export function categorySum(month: Partial<Record<Category, number>> | undefined, cats: Category[]): number {
  if (!month) return 0;
  return sum(cats.map((c) => month[c] ?? 0));
}

/** The most recent fully-observed month (the current month once the demo date is at month end). */
export function analysisMonth(state: CustomerState): string {
  const d = parseDate(state.today);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return d.getUTCDate() >= lastDay - 1 ? monthKey(state.today) : monthKey(addMonths(state.today, -1));
}

export function spendingComparison(state: CustomerState, month = analysisMonth(state)): SpendingCategory[] {
  const totals = monthlyTotals(state);
  const baselineMonths = recentMonthKeys(`${month}-01`, 7).slice(0, 6).filter((m) => totals[m]);
  const cats: Category[] = [...DISCRETIONARY, ...VARIABLE.filter((c) => !DISCRETIONARY.includes(c)), "utilities"];
  return cats.map((c) => {
    const thisMonth = totals[month]?.[c] ?? 0;
    const average = avg(baselineMonths.map((m) => totals[m]?.[c] ?? 0));
    return { category: c, thisMonth: round(thisMonth), average: round(average), changePct: average ? (thisMonth - average) / average : 0 };
  });
}

export function recurringPrice(r: RecurringPayment, date: ISODate): number {
  let amount = r.priceHistory[0].amount;
  for (const p of r.priceHistory) if (p.from <= date) amount = p.amount;
  return amount;
}

/** Daily closing balance of the current account, reconstructed backwards from today. */
export function balanceOn(state: CustomerState, date: ISODate): number {
  const current = state.accounts.find((a) => a.type === "current")!.balance;
  const after = state.transactions.filter((t) => t.date > date && t.date <= state.today);
  return current - sum(after.map((t) => t.amount));
}

export function salaryDay(state: CustomerState): number {
  const salaries = state.transactions.filter((t) => t.category === "salary");
  return salaries.length ? parseDate(salaries[salaries.length - 1].date).getUTCDate() : 25;
}

export function salaryChange(state: CustomerState) {
  const salaries = state.transactions.filter((t) => t.category === "salary");
  const latest = salaries[salaries.length - 1];
  const firstAtLatest = salaries.find((s) => s.amount === latest.amount)!;
  const previous = [...salaries].reverse().find((s) => s.amount !== latest.amount);
  return { latest: latest.amount, previous: previous?.amount ?? latest.amount, since: firstAtLatest.date };
}

/** Monthly amount left unallocated after spending and goal transfers (median = typical month). */
export function monthlySurplus(state: CustomerState): { typical: number; series: { month: string; surplus: number }[] } {
  const totals = monthlyTotals(state);
  const income = incomeByMonth(state);
  const { since } = salaryChange(state);
  const months = Object.keys(income).filter((m) => m >= monthKey(since) && m <= analysisMonth(state)).sort();
  const series = months.map((m) => ({ month: m, surplus: round(income[m] - sum(Object.values(totals[m] ?? {}))) }));
  return { typical: round(median(series.map((s) => s.surplus))), series };
}

function nextSalaryDate(state: CustomerState): ISODate {
  const day = salaryDay(state);
  const d = parseDate(state.today);
  const candidate = toISO(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), day, 12)));
  return candidate > state.today ? candidate : addMonths(candidate, 1);
}

/** Projects the current-account balance until the next salary arrives. */
export function cashflowForecast(state: CustomerState): CashflowForecast {
  const today = state.today;
  const salaryDate = nextSalaryDate(state);
  const obligations: CashflowForecast["obligations"] = [];

  for (const r of state.recurring) {
    if (r.status !== "active") continue;
    for (let i = 0; i <= 1; i++) {
      const base = addMonths(`${monthKey(today)}-01`, i);
      const date = `${base.slice(0, 8)}${String(r.dayOfMonth).padStart(2, "0")}`;
      if (date > today && date < salaryDate) obligations.push({ label: r.merchant, amount: recurringPrice(r, date), date });
    }
  }
  for (const g of state.goals) {
    if (g.nextTransferDate > today && g.nextTransferDate < salaryDate) {
      obligations.push({ label: `Transfer to ${g.name}`, amount: g.monthlyContribution, date: g.nextTransferDate });
    }
  }
  for (const u of state.upcoming) {
    if (u.dueDate > today && u.dueDate < salaryDate) obligations.push({ label: u.merchant, amount: u.amount, date: u.dueDate });
  }
  obligations.sort((a, b) => a.date.localeCompare(b.date));

  const totals = monthlyTotals(state, true);
  const recent = recentMonthKeys(`${analysisMonth(state)}-01`, 3);
  const dailyVariable = avg(recent.map((m) => categorySum(totals[m], VARIABLE))) / 30.4;
  const days = daysBetween(today, salaryDate) - 1;
  const currentBalance = balanceOn(state, today);

  let balance = currentBalance;
  let lowest = balance;
  let lowestDate = today;
  for (let i = 1; i <= days; i++) {
    const date = addDays(today, i);
    balance -= dailyVariable + sum(obligations.filter((o) => o.date === date).map((o) => o.amount));
    if (balance < lowest) {
      lowest = balance;
      lowestDate = date;
    }
  }

  const day = salaryDay(state);
  const usualLows = recent.map((m) => balanceOn(state, `${m}-${String(day - 1).padStart(2, "0")}`));

  return {
    currentBalance: round(currentBalance),
    nextSalaryDate: salaryDate,
    lowestProjected: round(lowest, 10),
    lowestDate,
    usualLowPoint: round(avg(usualLows), 10),
    obligations,
    monthlySurplus: monthlySurplus(state).typical,
  };
}

export function unusedSubscriptions(state: CustomerState, minDays = 60) {
  return state.recurring
    .filter((r) => r.category === "subscriptions" && r.status === "active" && r.lastUsed)
    .map((r) => ({ recurring: r, daysUnused: daysBetween(r.lastUsed!, state.today) }))
    .filter((x) => x.daysUnused >= minDays);
}

export function priceIncreases(state: CustomerState, withinDays = 120) {
  return state.recurring
    .filter((r) => r.status === "active" && r.priceHistory.length > 1)
    .map((r) => {
      const last = r.priceHistory[r.priceHistory.length - 1];
      const prev = r.priceHistory[r.priceHistory.length - 2];
      return { recurring: r, from: prev.amount, to: last.amount, since: last.from, changePct: (last.amount - prev.amount) / prev.amount };
    })
    .filter((x) => x.changePct > 0 && daysBetween(x.since, state.today) <= withinDays);
}
