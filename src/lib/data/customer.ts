/**
 * Synthetic demo customer "Sophie". All data is fictional.
 * Merchant names are invented; any resemblance to real companies is coincidental.
 */
import type {
  Account,
  CustomerProfile,
  Goal,
  InsuranceProduct,
  Loan,
  Preferences,
  RecurringPayment,
} from "@/lib/types/domain";

export const DEMO_TODAY = "2026-09-30";

export const profile: CustomerProfile = {
  id: "cust-sophie-001",
  firstName: "Sophie",
  lastName: "Peeters",
  age: 34,
  ageRange: "30-39",
  location: "Ghent, Belgium",
  household: "Single, no children",
  employment: "Full-time, UX researcher",
  monthlyNetIncome: 3400,
  incomeBand: "€3,000-€3,500 net / month",
  riskPreference: "balanced",
  preferredChannel: "whatsapp",
  safetyBuffer: 2000,
  memberSince: "2014",
};

export const CURRENT_ACCOUNT_BALANCE = 5850;

export const accounts: Account[] = [
  { id: "acc-current", type: "current", name: "Current account", balance: CURRENT_ACCOUNT_BALANCE },
  { id: "acc-house", type: "savings", name: "Savings - House deposit", balance: 12500 },
  { id: "acc-japan", type: "savings", name: "Savings - Japan trip", balance: 1800 },
  { id: "acc-emergency", type: "savings", name: "Savings - Emergency fund", balance: 6500 },
  { id: "acc-invest", type: "investment", name: "Balanced fund portfolio (demo)", balance: 6000 },
];

export const loans: Loan[] = [
  {
    id: "loan-furniture",
    name: "Furniture instalment loan",
    principal: 3600,
    remaining: 1650,
    monthlyPayment: 150,
    annualRate: 0.049,
    endDate: "2027-08-10",
  },
];

export const insurance: InsuranceProduct[] = [
  {
    id: "ins-home",
    name: "Home contents & family liability",
    type: "home",
    premium: 780,
    frequency: "annual",
    nextDueDate: "2026-10-02",
    coverage: "Contents of rented apartment, third-party family liability",
  },
  {
    id: "ins-hospital",
    name: "Hospitalisation cover",
    type: "health",
    premium: 16,
    frequency: "monthly",
    nextDueDate: "2026-10-05",
    coverage: "Hospital stays, pre- and post-hospital care",
  },
];

const monthly = (from: string, amount: number) => [{ from, amount }];

export const recurring: RecurringPayment[] = [
  { id: "rec-rent", merchant: "Lievens Residential", category: "rent", amount: 900, dayOfMonth: 1, essential: true, priceHistory: monthly("2025-01-01", 900), status: "active" },
  { id: "rec-energy", merchant: "Voltera Energy", category: "utilities", amount: 164, dayOfMonth: 15, essential: true, priceHistory: [{ from: "2025-01-01", amount: 122 }, { from: "2026-09-01", amount: 164 }], status: "active" },
  { id: "rec-water", merchant: "AquaFlow", category: "utilities", amount: 25, dayOfMonth: 12, essential: true, priceHistory: monthly("2025-01-01", 25), status: "active" },
  { id: "rec-telecom", merchant: "TelcoNet Fiber+Mobile", category: "telecom", amount: 50, dayOfMonth: 8, essential: true, priceHistory: monthly("2025-01-01", 50), status: "active" },
  { id: "rec-hospital", merchant: "Hospitalisation cover", category: "insurance", amount: 16, dayOfMonth: 5, essential: true, priceHistory: monthly("2025-01-01", 16), status: "active" },
  { id: "rec-loan", merchant: "Furniture instalment loan", category: "loan", amount: 150, dayOfMonth: 10, essential: true, priceHistory: monthly("2025-01-01", 150), status: "active" },
  { id: "rec-streamflix", merchant: "StreamFlix", category: "subscriptions", amount: 13.99, dayOfMonth: 3, essential: false, priceHistory: [{ from: "2025-01-01", amount: 11.99 }, { from: "2026-07-01", amount: 13.99 }], lastUsed: "2026-09-28", status: "active" },
  { id: "rec-soundwave", merchant: "Soundwave Music", category: "subscriptions", amount: 10.99, dayOfMonth: 6, essential: false, priceHistory: monthly("2025-01-01", 10.99), lastUsed: "2026-09-29", status: "active" },
  { id: "rec-gym", merchant: "FitHub Gym", category: "subscriptions", amount: 35, dayOfMonth: 2, essential: false, priceHistory: monthly("2025-01-01", 35), lastUsed: "2026-09-26", status: "active" },
  { id: "rec-cinemax", merchant: "CineMax+ Premium", category: "subscriptions", amount: 29, dayOfMonth: 18, essential: false, priceHistory: monthly("2025-06-01", 29), lastUsed: "2026-06-14", status: "active" },
  { id: "rec-cloud", merchant: "CloudBox Storage", category: "subscriptions", amount: 2.99, dayOfMonth: 21, essential: false, priceHistory: monthly("2025-01-01", 2.99), lastUsed: "2026-09-20", status: "active" },
];

/** Builds month-end goal history backwards from the current amount. */
function history(current: number, monthlyStep: number, months: number, endMonth = "2026-09") {
  const [y, m] = endMonth.split("-").map(Number);
  const out: { month: string; amount: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    out.push({ month: d.toISOString().slice(0, 7), amount: Math.max(0, current - i * monthlyStep) });
  }
  return out;
}

export const goals: Goal[] = [
  {
    id: "goal-house",
    name: "House deposit",
    type: "house",
    targetAmount: 40000,
    currentAmount: 12500,
    targetDate: "2030-03-31",
    originalTargetDate: "2030-03-31",
    priority: "high",
    monthlyContribution: 630,
    nextTransferDate: "2026-10-01",
    milestoneAmounts: [10000, 20000, 30000, 40000],
    history: history(12500, 630, 12),
    createdAt: "2024-03-01",
  },
  {
    id: "goal-japan",
    name: "Japan trip",
    type: "travel",
    targetAmount: 4000,
    currentAmount: 1800,
    targetDate: "2027-07-31",
    originalTargetDate: "2027-07-31",
    priority: "medium",
    monthlyContribution: 225,
    nextTransferDate: "2026-10-01",
    milestoneAmounts: [1000, 2000, 3000, 4000],
    history: history(1800, 225, 8),
    createdAt: "2026-02-01",
  },
  {
    id: "goal-emergency",
    name: "Emergency fund",
    type: "emergency",
    targetAmount: 9000,
    currentAmount: 6500,
    targetDate: "2027-09-30",
    originalTargetDate: "2027-09-30",
    priority: "high",
    monthlyContribution: 250,
    nextTransferDate: "2026-10-01",
    milestoneAmounts: [2250, 4500, 6750, 9000],
    history: history(6500, 250, 12),
    createdAt: "2024-09-01",
  },
];

export const defaultPreferences: Preferences = {
  copilotEnabled: true,
  proactiveEnabled: true,
  frequency: "balanced",
  channels: { app: true, web: true, whatsapp: true, email: false },
  topics: { spending: true, saving: true, goals: true, bills: true, investing: false, insurance: true, milestones: true },
  milestoneNotifications: true,
  progressReminders: true,
  consent: { transactionAnalysis: true, conversationMemory: true, messagingChannel: true },
  neverRecommend: [],
};
