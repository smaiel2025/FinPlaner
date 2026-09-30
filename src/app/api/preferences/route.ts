import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/api/http";
import { customerService } from "@/lib/services/mock";
import { getState } from "@/lib/services/store";

export const dynamic = "force-dynamic";

const Topics = z.object({
  spending: z.boolean(), saving: z.boolean(), goals: z.boolean(), bills: z.boolean(),
  investing: z.boolean(), insurance: z.boolean(), milestones: z.boolean(),
}).partial();

const Patch = z.object({
  proactiveEnabled: z.boolean(),
  frequency: z.enum(["minimal", "balanced", "proactive"]),
  channels: z.object({ app: z.boolean(), web: z.boolean(), whatsapp: z.boolean(), email: z.boolean() }).partial(),
  topics: Topics,
  milestoneNotifications: z.boolean(),
  progressReminders: z.boolean(),
  consent: z.object({ transactionAnalysis: z.boolean(), conversationMemory: z.boolean(), messagingChannel: z.boolean() }).partial(),
}).partial();

export function GET() {
  return ok({ preferences: getState().preferences });
}

export const PATCH = handle(async (req: Request) => {
  const patch = await parseBody(req, Patch);
  const current = getState().preferences;
  const merged = {
    ...current,
    ...patch,
    channels: { ...current.channels, ...patch.channels },
    topics: { ...current.topics, ...patch.topics },
    consent: { ...current.consent, ...patch.consent },
  };
  return ok({ preferences: customerService.updatePreferences("cust-sophie-001", merged) });
});
