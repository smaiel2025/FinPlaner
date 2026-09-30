import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/http";
import { aiStatus } from "@/lib/ai/adapter";
import { scoreAll } from "@/lib/engine";
import { DETECTORS } from "@/lib/engine/opportunities";
import { SCORE_WEIGHTS, THRESHOLDS } from "@/lib/engine/relevance";
import { getState } from "@/lib/services/store";

export const dynamic = "force-dynamic";

/** Decision traces for the admin view. `?threshold=` previews a different relevance gate. */
export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("threshold");
  const parsed = raw === null ? undefined : Number(raw);
  const threshold = parsed !== undefined && Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : undefined;
  const state = getState();
  return ok({
    today: state.today,
    traces: scoreAll(state, threshold),
    detectors: DETECTORS.map((d) => d.name),
    weights: SCORE_WEIGHTS,
    thresholds: THRESHOLDS,
    activeThreshold: threshold ?? THRESHOLDS[state.preferences.frequency],
    events: state.events,
    notifications: state.notifications,
    actions: state.actions,
    feedback: state.feedback,
    ai: aiStatus(),
  });
}
