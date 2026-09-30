import type { CustomerState } from "@/lib/types/domain";
import { createSeedState } from "./seed";

/**
 * Single-customer in-memory store. Kept on globalThis so state survives
 * Next.js dev hot reloads. Not suitable for multi-instance deployments.
 */
const globalStore = globalThis as unknown as { __copilotState?: CustomerState };

export function getState(): CustomerState {
  if (!globalStore.__copilotState) globalStore.__copilotState = createSeedState();
  return globalStore.__copilotState;
}

export function mutate(mutator: (state: CustomerState) => void): CustomerState {
  const state = getState();
  mutator(state);
  return state;
}

export function resetState(): CustomerState {
  globalStore.__copilotState = createSeedState();
  return globalStore.__copilotState;
}

let counter = 0;
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}
