import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/api/http";
import { forgetFact, resolveFact } from "@/lib/services/actions";

const Resolve = z.object({ factId: z.string().min(1), apply: z.boolean() });
const Forget = z.object({ factId: z.string().min(1) });

/** Confirm (or decline) a context update learned from the conversation. */
export const POST = handle(async (req: Request) => {
  const { factId, apply } = await parseBody(req, Resolve);
  return ok({ message: resolveFact(factId, apply) });
});

/** Customer asks the assistant to forget something. */
export const DELETE = handle(async (req: Request) => {
  const { factId } = await parseBody(req, Forget);
  forgetFact(factId);
  return ok({ ok: true });
});
