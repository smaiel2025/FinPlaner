import { ok } from "@/lib/api/http";
import { scoreAll } from "@/lib/engine";
import { getState } from "@/lib/services/store";

export const dynamic = "force-dynamic";

/** All detected opportunities (surfaced and suppressed) with relevance scoring. */
export function GET() {
  return ok({ opportunities: scoreAll(getState()) });
}
