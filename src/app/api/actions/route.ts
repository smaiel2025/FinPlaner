import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/api/http";
import { approveActions } from "@/lib/services/actions";
import { getState } from "@/lib/services/store";

export const dynamic = "force-dynamic";

const Body = z.object({
  opportunityKey: z.string().min(1),
  actionIds: z.array(z.string().min(1)).min(1),
  approved: z.literal(true),
});

export function GET() {
  return ok({ actions: getState().actions });
}

/** Executes (simulated) actions - requires an explicit customer approval flag. */
export const POST = handle(async (req: Request) => {
  const { opportunityKey, actionIds } = await parseBody(req, Body);
  return ok(approveActions(opportunityKey, actionIds));
});
