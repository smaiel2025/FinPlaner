/**
 * Deterministic synthetic transaction generator (seeded PRNG).
 * Produces 7 months of current-account activity (Mar-Sep 2026) plus last year's
 * annual insurance payment, which lets the engine predict this year's payment.
 *
 * Intentional storylines:
 *  - salary increase from €3,150 to €3,400 in June
 *  - energy bill jumps from ~€122 to €164 in September
 *  - restaurant spending ~40% above normal in September
 *  - StreamFlix price increase in July
 *  - CineMax+ Premium keeps charging but has not been used since mid-June
 *  - one-off laptop purchase in August (unusual transaction)
 */
import type { Category, Transaction } from "@/lib/types/domain";
import { recurring } from "./customer";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTHS = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"];

const ENERGY = [131, 124, 117, 112, 118, 130, 164];
const VARIABLE: Record<string, { targets: number[]; count: number; merchants: string[]; category: Category }> = {
  groceries: { targets: [318, 326, 312, 331, 322, 316, 324], count: 8, merchants: ["MarktVers", "SuperDag", "BioBuurt", "Bakkerij Lof"], category: "groceries" },
  restaurants: { targets: [148, 151, 146, 158, 155, 154, 214], count: 5, merchants: ["Brasserie Lune", "Sushi Kaze", "Pizzeria Nonna", "Café Central", "Thai Orchid"], category: "restaurants" },
  shopping: { targets: [121, 96, 128, 104, 112, 117, 94], count: 3, merchants: ["ModeHuis", "BookNook", "HomeLab"], category: "shopping" },
  entertainment: { targets: [42, 36, 54, 44, 41, 33, 38], count: 2, merchants: ["CineStar Gent", "Concert Hall Vooruit"], category: "entertainment" },
  transport: { targets: [58, 61, 60, 59, 62, 60, 61], count: 3, merchants: ["RailBE", "CityBike Gent"], category: "transport" },
  health: { targets: [14, 0, 26, 9, 16, 21, 12], count: 1, merchants: ["Apotheek Zon"], category: "health" },
};

const GOAL_TRANSFERS = [
  { goalId: "goal-house", merchant: "Transfer to House deposit", amount: 630 },
  { goalId: "goal-japan", merchant: "Transfer to Japan trip", amount: 225 },
  { goalId: "goal-emergency", merchant: "Transfer to Emergency fund", amount: 250 },
];

function priceOn(priceHistory: { from: string; amount: number }[], date: string): number {
  let amount = priceHistory[0].amount;
  for (const p of priceHistory) if (p.from <= date) amount = p.amount;
  return amount;
}

export function generateTransactions(seed = 20260930): Transaction[] {
  const rand = mulberry32(seed);
  const txs: Transaction[] = [];
  let n = 0;
  const push = (t: Omit<Transaction, "id">) => txs.push({ id: `tx-${String(++n).padStart(4, "0")}`, ...t });
  const day = (month: string, d: number) => `${month}-${String(d).padStart(2, "0")}`;

  push({ date: "2025-10-02", amount: -764, category: "insurance", merchant: "Home contents & family liability" });
  push({ date: "2026-08-17", amount: -449, category: "shopping", merchant: "TechPoint - Laptop" });

  MONTHS.forEach((month, mi) => {
    for (const g of GOAL_TRANSFERS) {
      push({ date: day(month, 1), amount: -g.amount, category: "savings_transfer", merchant: g.merchant, goalId: g.goalId });
    }
    for (const r of recurring) {
      if (r.priceHistory[0].from > day(month, 28)) continue;
      const amount = r.id === "rec-energy" ? ENERGY[mi] : priceOn(r.priceHistory, day(month, r.dayOfMonth));
      push({ date: day(month, r.dayOfMonth), amount: -amount, category: r.category, merchant: r.merchant, recurringId: r.id });
    }
    push({ date: day(month, 25), amount: mi < 3 ? 3150 : 3400, category: "salary", merchant: "Brightwave NV - Salary" });

    for (const spec of Object.values(VARIABLE)) {
      const target = spec.targets[mi];
      if (target <= 0) continue;
      const weights = Array.from({ length: spec.count }, () => 0.5 + rand());
      const total = weights.reduce((a, b) => a + b, 0);
      let allocated = 0;
      weights.forEach((w, i) => {
        const isLast = i === spec.count - 1;
        const amount = isLast ? Math.round((target - allocated) * 100) / 100 : Math.round((target * w) / total * 100) / 100;
        allocated += amount;
        const d = 2 + Math.floor(rand() * 27);
        push({ date: day(month, d), amount: -amount, category: spec.category, merchant: spec.merchants[Math.floor(rand() * spec.merchants.length)] });
      });
    }
  });

  return txs.sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date)));
}
