import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/api/http";
import { respond } from "@/lib/ai/copilot";
import { getState } from "@/lib/services/store";

export const dynamic = "force-dynamic";

const Body = z.object({
  message: z.string().min(1).max(500),
  channel: z.enum(["app", "whatsapp"]).default("app"),
});

/** The shared conversation (all channels). */
export function GET() {
  return ok({ messages: getState().conversation, memory: getState().memory });
}

export const POST = handle(async (req: Request) => {
  const { message, channel } = await parseBody(req, Body);
  const reply = await respond(message, channel);
  return ok({ reply });
});
