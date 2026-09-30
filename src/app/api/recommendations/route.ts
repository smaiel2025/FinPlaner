import { ok } from "@/lib/api/http";
import { scoreAll } from "@/lib/engine";
import { getState } from "@/lib/services/store";

export const dynamic = "force-dynamic";

/** Only recommendations that passed the relevance gate. */
export function GET() {
  return ok({ recommendations: scoreAll(getState()).filter((o) => o.relevance.surfaced && o.type !== "contextual_decision") });
}
