import { ok } from "@/lib/api/http";
import { getState } from "@/lib/services/store";

export const dynamic = "force-dynamic";

export function GET() {
  return ok({ notifications: getState().notifications });
}
