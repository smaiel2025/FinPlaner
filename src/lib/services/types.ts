/**
 * Service boundaries. The POC ships mock implementations backed by an in-memory
 * store; production would implement these against KBC core banking, product and
 * CRM APIs without touching the engine or UI.
 */
import type { CustomerState, Goal, Preferences, Transaction } from "@/lib/types/domain";

export interface CustomerService {
  getState(customerId: string): CustomerState;
  updatePreferences(customerId: string, patch: Partial<Preferences>): Preferences;
  reset(customerId: string): CustomerState;
}

export interface TransactionService {
  list(customerId: string): Transaction[];
  record(customerId: string, tx: Omit<Transaction, "id">): Transaction;
}

export interface GoalService {
  list(customerId: string): Goal[];
  update(customerId: string, goalId: string, patch: Partial<Goal>): Goal;
  contribute(customerId: string, goalId: string, amount: number, date: string): Goal;
}
