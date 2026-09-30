import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/api/http";
import { allowAgain, recordFeedback } from "@/lib/services/actions";

const Body = z.object({ outcome: z.enum(["dismissed", "never"]) });

type Params = { params: Promise<{ key: string }> };

/** "Not now" or "Don't recommend this again". */
export const POST = handle(async (req: Request, { params }: Params) => {
  const { key } = await params;
  const { outcome } = await parseBody(req, Body);
  recordFeedback(decodeURIComponent(key), outcome);
  return ok({ ok: true });
});

/** Re-allow a recommendation the customer previously blocked. */
export const DELETE = handle(async (_req: Request, { params }: Params) => {
  const { key } = await params;
  allowAgain(decodeURIComponent(key));
  return ok({ ok: true });
});
