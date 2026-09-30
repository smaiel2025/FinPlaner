import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/api/http";
import { triggerEvent } from "@/lib/services/events";
import { getState } from "@/lib/services/store";

export const dynamic = "force-dynamic";

const Body = z.object({ event: z.enum(["insurance_invoice", "standing_orders", "reset"]) });

export function GET() {
  return ok({ events: getState().events });
}

/** Demo-only: simulates incoming banking events. */
export const POST = handle(async (req: Request) => {
  const { event } = await parseBody(req, Body);
  const result = triggerEvent(event);
  return ok({ label: result.label, notified: result.notified.map((o) => ({ key: o.key, title: o.title, channel: o.channel })) });
});
