import clsx from "clsx";
import type { HealthFactor } from "@/lib/types/intelligence";
import { ProgressBar } from "@/components/goals/ProgressBar";

export function FactorList({ factors }: { factors: HealthFactor[] }) {
  return (
    <ul className="divide-y divide-line">
      {factors.map((f) => {
        const delta = f.score - f.previousScore;
        return (
          <li key={f.id} className="py-3.5">
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-ink">{f.label}</span>
                <span className="ml-2 text-[12px] text-muted">weight {Math.round(f.weight * 100)}%</span>
              </div>
              <div className="tabular flex items-baseline gap-2 text-sm">
                <span className="font-semibold text-ink">{f.score}</span>
                {delta !== 0 && <span className={clsx("text-[12px]", delta > 0 ? "text-growth" : "text-attention")}>{delta > 0 ? "+" : ""}{delta}</span>}
              </div>
            </div>
            <ProgressBar value={f.score / 100} previous={f.previousScore / 100} height="h-1.5" tone={f.score >= 60 ? "brand" : "attention"} />
            <p className="mt-1.5 text-[12px] text-muted">{f.detail}</p>
          </li>
        );
      })}
    </ul>
  );
}
