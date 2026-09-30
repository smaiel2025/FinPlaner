import { ok } from "@/lib/api/http";
import { customerService } from "@/lib/services/mock";

export const dynamic = "force-dynamic";

/** Raw customer data (synthetic). */
export function GET() {
  const s = customerService.getState("cust-sophie-001");
  return ok({ profile: s.profile, accounts: s.accounts, loans: s.loans, insurance: s.insurance, recurring: s.recurring, upcoming: s.upcoming, transactionCount: s.transactions.length });
}
