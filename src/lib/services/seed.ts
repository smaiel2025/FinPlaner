import type { CustomerState } from "@/lib/types/domain";
import { DEMO_TODAY, accounts, defaultPreferences, goals, insurance, loans, profile, recurring } from "@/lib/data/customer";
import { generateTransactions } from "@/lib/data/transactions";
import { upcomingPayments } from "@/lib/data/upcoming";

/** Milestones already reached before the demo starts count as acknowledged (no stale recognition). */
function preAcknowledged(): string[] {
  return goals.flatMap((g) => g.milestoneAmounts.filter((m) => m <= g.currentAmount).map((m) => `${g.id}:${m}`));
}

/** Fresh deep copy of the synthetic customer, so demo mutations never leak into the seed. */
export function createSeedState(): CustomerState {
  return structuredClone({
    today: DEMO_TODAY,
    profile,
    accounts,
    loans,
    insurance,
    recurring,
    upcoming: upcomingPayments,
    transactions: generateTransactions(),
    goals,
    preferences: defaultPreferences,
    memory: [],
    feedback: [],
    notifications: [],
    actions: [],
    events: [],
    acknowledgedMilestones: preAcknowledged(),
    conversation: [],
  });
}
