import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Card, SectionTitle } from "@/components/ui/primitives";
import type { CustomerContext } from "@/lib/engine";
import { eur } from "@/lib/utils/format";

export function RecentProgress({ ctx }: { ctx: CustomerContext }) {
  const added = ctx.projections.reduce((s, p) => s + p.last90Days, 0);
  const house = ctx.projections.find((p) => p.goal.type === "house");
  const streak = ctx.streaks.find((s) => s.id === "saving");
  const best = ctx.personalBests[0];

  return (
    <Card className="h-full p-6">
      <SectionTitle title="Recent progress" subtitle="Compared only with your own history" />
      <div className="flex items-center gap-3 rounded-2xl bg-growth-50 p-4">
        <TrendingUp className="text-growth" size={20} />
        <div>
          <div className="tabular text-lg font-semibold text-ink">+{eur(added)}</div>
          <div className="text-[12px] text-slate-600">added to your goals in the last 90 days</div>
        </div>
      </div>
      <ul className="mt-4 space-y-3 text-[13px] text-slate-700">
        {house && <li>You are now <span className="font-semibold text-ink">{Math.round(house.progress * 100)}%</span> of the way toward your home deposit.</li>}
        {streak && streak.months > 0 && <li>{streak.label}.</li>}
        {best && <li>{best.label}.</li>}
      </ul>
      <Link href="/progress" className="mt-4 inline-block text-[13px] font-medium text-brand hover:underline">See your progress</Link>
    </Card>
  );
}
