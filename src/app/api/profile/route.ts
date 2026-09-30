import { ok } from "@/lib/api/http";
import { buildSnapshot } from "@/lib/api/snapshot";

export const dynamic = "force-dynamic";

/** Full customer understanding: profile, health, goals, forecast, feed. */
export function GET() {
  return ok(buildSnapshot());
}
