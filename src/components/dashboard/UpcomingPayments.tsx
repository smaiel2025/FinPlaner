import { Card, SectionTitle } from "@/components/ui/primitives";
import type { CashflowForecast } from "@/lib/types/intelligence";
import { eur, shortDate } from "@/lib/utils/format";

export function UpcomingPayments({ forecast }: { forecast: CashflowForecast }) {
  const items = [...forecast.obligations].sort((a, b) => b.amount - a.amount).slice(0, 6).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <Card className="h-full p-6">
      <SectionTitle title="Upcoming before payday" subtitle={`Largest of ${forecast.obligations.length} scheduled payments`} />
      <ul className="divide-y divide-line">
        {items.map((o) => (
          <li key={`${o.label}-${o.date}`} className="flex items-center justify-between py-2.5 text-[13px]">
            <div className="flex items-center gap-3">
              <span className="w-12 text-[12px] text-muted">{shortDate(o.date)}</span>
              <span className="text-ink">{o.label}</span>
            </div>
            <span className="tabular font-medium text-ink">-{eur(o.amount)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
