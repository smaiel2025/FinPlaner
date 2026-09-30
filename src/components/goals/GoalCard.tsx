"use client";

import Link from "next/link";
import type { GoalProjection } from "@/lib/types/intelligence";
import { eur, monthYear } from "@/lib/utils/format";
import { Badge, Card } from "@/components/ui/primitives";
import { GOAL_ICON } from "./goalMeta";
import { ProgressBar } from "./ProgressBar";

export function onTrackBadge(p: GoalProjection) {
  if (p.monthsAheadOfTarget >= 1) return <Badge tone="positive">{Math.round(p.monthsAheadOfTarget)} mo ahead</Badge>;
  if (p.onTrack) return <Badge tone="positive">On track</Badge>;
  return <Badge tone="attention">{Math.round(-p.monthsAheadOfTarget)} mo behind</Badge>;
}

export function GoalCard({ p, highlight = false }: { p: GoalProjection; highlight?: boolean }) {
  const Icon = GOAL_ICON[p.goal.type];
  const ticks = p.goal.milestoneAmounts.filter((m) => m < p.goal.targetAmount).map((m) => m / p.goal.targetAmount);
  return (
    <Link href={`/goals/${p.goal.id}`} className="block">
      <Card className={`h-full p-5 transition-shadow hover:shadow-lift ${highlight ? "milestone-glow" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand">
              <Icon size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">{p.goal.name}</div>
              <div className="text-[12px] text-muted">Target {monthYear(p.goal.targetDate)}</div>
            </div>
          </div>
          {onTrackBadge(p)}
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="tabular text-lg font-semibold text-ink">
            {eur(p.goal.currentAmount)} <span className="text-sm font-normal text-muted">/ {eur(p.goal.targetAmount)}</span>
          </div>
          <div className="tabular text-sm font-semibold text-brand">{Math.round(p.progress * 100)}%</div>
        </div>
        <div className="mt-2">
          <ProgressBar value={p.progress} ticks={ticks} tone={p.goal.type === "emergency" ? "growth" : "brand"} />
        </div>
        <div className="mt-3 flex justify-between text-[12px] text-muted">
          <span>Projected {monthYear(p.projectedDate)}</span>
          {p.nextMilestone && <span>Next: {eur(p.nextMilestone)}</span>}
        </div>
      </Card>
    </Link>
  );
}
