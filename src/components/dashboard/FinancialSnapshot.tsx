import { Card, SectionTitle, Stat } from "@/components/ui/primitives";
import type { CustomerContext } from "@/lib/engine";
import { eur, shortDate } from "@/lib/utils/format";

export function FinancialSnapshot({ ctx }: { ctx: CustomerContext }) {
  const current = ctx.accounts.find((a) => a.type === "current")?.balance ?? 0;
  const savings = ctx.accounts.filter((a) => a.type === "savings").reduce((s, a) => s + a.balance, 0);
  const invest = ctx.accounts.filter((a) => a.type === "investment").reduce((s, a) => s + a.balance, 0);
  const belowBuffer = ctx.forecast.lowestProjected < ctx.profile.safetyBuffer;

  return (
    <Card className="h-full p-6">
      <SectionTitle title="Financial snapshot" subtitle="Across your KBC accounts" />
      <div className="grid grid-cols-2 gap-5">
        <Stat label="Current account" value={eur(current)} />
        <Stat label="Savings" value={eur(savings)} hint="3 goal pots" />
        <Stat label="Investments" value={eur(invest)} hint="Balanced fund" />
        <Stat label="Loans" value={eur(ctx.financial.debtRemaining)} hint="Furniture loan" />
      </div>
      <div className="mt-5 rounded-2xl bg-surface p-4">
        <div className="text-[12px] font-medium uppercase tracking-wide text-muted">Before next salary ({shortDate(ctx.forecast.nextSalaryDate)})</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`tabular text-lg font-semibold ${belowBuffer ? "text-attention" : "text-ink"}`}>{eur(ctx.forecast.lowestProjected)}</span>
          <span className="text-[12px] text-muted">projected lowest balance · safety balance {eur(ctx.profile.safetyBuffer)}</span>
        </div>
      </div>
    </Card>
  );
}
