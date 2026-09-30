import { ok } from "@/lib/api/http";
import { projectAll, projectionSeries } from "@/lib/engine/goals";
import { getState } from "@/lib/services/store";

export const dynamic = "force-dynamic";

export function GET() {
  const state = getState();
  return ok({
    goals: projectAll(state).map((p) => ({ ...p, forecast: projectionSeries(p.goal, state.today) })),
  });
}
