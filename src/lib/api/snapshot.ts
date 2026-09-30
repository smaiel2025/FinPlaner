import { aiStatus } from "@/lib/ai/adapter";
import { buildBriefing } from "@/lib/ai/briefing";
import { analyzeCustomer } from "@/lib/engine";
import { getState } from "@/lib/services/store";

/** Everything the customer-facing screens need in one payload. */
export function buildSnapshot() {
  const context = analyzeCustomer(getState());
  return { context, briefing: buildBriefing(context), ai: aiStatus() };
}

export type Snapshot = ReturnType<typeof buildSnapshot>;
