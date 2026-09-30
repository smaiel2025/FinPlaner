import type { CustomerService, GoalService, TransactionService } from "../types";
import { getState, mutate, nextId, resetState } from "../store";

function account(state: ReturnType<typeof getState>, id: string) {
  const acc = state.accounts.find((a) => a.id === id);
  if (!acc) throw new Error(`Unknown account ${id}`);
  return acc;
}

const GOAL_ACCOUNT: Record<string, string> = {
  "goal-house": "acc-house",
  "goal-japan": "acc-japan",
  "goal-emergency": "acc-emergency",
};

export const customerService: CustomerService = {
  getState: () => getState(),
  updatePreferences: (_id, patch) => mutate((s) => void (s.preferences = { ...s.preferences, ...patch })).preferences,
  reset: () => resetState(),
};

export const transactionService: TransactionService = {
  list: () => getState().transactions,
  record: (_id, tx) => {
    const created = { id: nextId("tx"), ...tx };
    mutate((s) => {
      s.transactions.push(created);
      account(s, "acc-current").balance = Math.round((account(s, "acc-current").balance + tx.amount) * 100) / 100;
    });
    return created;
  },
};

export const goalService: GoalService = {
  list: () => getState().goals,
  update: (_id, goalId, patch) => {
    let updated;
    mutate((s) => {
      const goal = s.goals.find((g) => g.id === goalId);
      if (!goal) throw new Error(`Unknown goal ${goalId}`);
      Object.assign(goal, patch);
      updated = goal;
    });
    return updated!;
  },
  /** Moves money from the current account into the goal's savings pot. */
  contribute: (customerId, goalId, amount, date) => {
    const state = getState();
    const goal = state.goals.find((g) => g.id === goalId);
    if (!goal) throw new Error(`Unknown goal ${goalId}`);
    if (amount <= 0) throw new Error("Contribution must be positive");
    transactionService.record(customerId, {
      date,
      amount: -amount,
      category: "savings_transfer",
      merchant: `Transfer to ${goal.name}`,
      goalId,
    });
    mutate((s) => {
      const g = s.goals.find((x) => x.id === goalId)!;
      g.currentAmount = Math.round((g.currentAmount + amount) * 100) / 100;
      const month = date.slice(0, 7);
      const snap = g.history.find((h) => h.month === month);
      if (snap) snap.amount = g.currentAmount;
      else g.history.push({ month, amount: g.currentAmount });
      const acc = GOAL_ACCOUNT[goalId];
      if (acc) account(s, acc).balance = g.currentAmount;
    });
    return getState().goals.find((g) => g.id === goalId)!;
  },
};
