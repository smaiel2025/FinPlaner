import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/api/http";
import { affordability, whatIfMonthly } from "@/lib/engine/simulate";
import { getState } from "@/lib/services/store";

const Body = z.discriminatedUnion("type", [
  z.object({ type: z.literal("affordability"), amount: z.number().positive().max(1_000_000), purpose: z.string().max(40).default("purchase") }),
  z.object({ type: z.literal("whatif"), goalId: z.string(), monthlyDelta: z.number().min(-5000).max(5000), oneOff: z.number().min(-100000).max(100000).default(0) }),
]);

/** Pure simulations - never change customer state. */
export const POST = handle(async (req: Request) => {
  const body = await parseBody(req, Body);
  const state = getState();
  if (body.type === "affordability") return ok({ result: affordability(state, body.amount, body.purpose) });
  return ok({ impact: whatIfMonthly(state, body.goalId, body.monthlyDelta, body.oneOff) });
});
