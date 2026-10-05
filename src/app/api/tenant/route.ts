import { z } from "zod";
import { handle, ok, parseBody } from "@/lib/api/http";
import { getActiveTenant, setActiveTenant, TENANTS } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const Body = z.object({ id: z.string().min(1) });

export function GET() {
  return ok({ tenant: getActiveTenant(), tenants: TENANTS.map((t) => ({ id: t.id, bankName: t.bankName })) });
}

export const POST = handle(async (req: Request) => {
  const { id } = await parseBody(req, Body);
  return ok({ tenant: setActiveTenant(id) });
});
