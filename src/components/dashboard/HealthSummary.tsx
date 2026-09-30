import Link from "next/link";
import { MomentumIndicator, ScoreChange } from "@/components/health/Momentum";
import { ScoreRing } from "@/components/health/ScoreRing";
import { Card } from "@/components/ui/primitives";
import type { HealthScore, Momentum } from "@/lib/types/intelligence";

export function HealthSummary({ health, momentum }: { health: HealthScore; momentum: Momentum }) {
  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold text-ink">Financial health</div>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">Demo metric</span>
      </div>
      <div className="mt-4 flex items-center gap-5">
        <ScoreRing score={health.score} size={112} />
        <div>
          <div className="text-lg font-semibold text-ink">{health.label}</div>
          <ScoreChange change={health.change} />
          <div className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted">Momentum</div>
          <div className="mt-1">
            <MomentumIndicator momentum={momentum} />
          </div>
        </div>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-slate-600">
        {health.change > 0 ? "Improved" : health.change < 0 ? "Changed" : "Held steady"} because {health.reasons.slice(0, 2).join(" and ")}.
      </p>
      <Link href="/health" className="mt-auto pt-3 text-[13px] font-medium text-brand hover:underline">
        What influenced my score?
      </Link>
    </Card>
  );
}
