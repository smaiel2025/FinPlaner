"use client";

import Link from "next/link";
import { onTrackBadge } from "@/components/goals/GoalCard";
import { GoalJourney } from "@/components/goals/GoalJourney";
import { GOAL_ICON } from "@/components/goals/goalMeta";
import { ProgressBar } from "@/components/goals/ProgressBar";
import { ProjectionTimeline } from "@/components/goals/ProjectionTimeline";
import { MomentumIndicator } from "@/components/health/Momentum";
import { PageHeader, WithSnapshot } from "@/components/ui/PageStates";
import { Card } from "@/components/ui/primitives";
import type { GoalProjection } from "@/lib/types/intelligence";
import { eur } from "@/lib/utils/format";

function paceText(p: GoalProjection) {
  const m = Math.round(Math.abs(p.monthsAheadOfTarget));
  if (p.monthsAheadOfTarget >= 1) return `At your current pace, you're about ${m} month${m === 1 ? "" : "s"} ahead of your plan.`;
  if (p.onTrack) return "At your current pace, you're on track for your target date.";
  return `At your current pace, you'd arrive about ${m} month${m === 1 ? "" : "s"} after your target. Small changes can close the gap.`;
}

export default function GoalsPage() {
  return (
    <WithSnapshot>
      {({ context: ctx }) => (
        <div>
          <PageHeader
            title="Goals & journey"
            subtitle="Where you want your life to go - and how today's decisions move you there."
            action={<div className="flex items-center gap-2 text-[13px] text-muted">Momentum <MomentumIndicator momentum={ctx.momentum} /></div>}
          />
          <div className="space-y-5">
            {ctx.projections.map((p) => {
              const Icon = GOAL_ICON[p.goal.type];
              return (
                <Card key={p.goal.id} className="grid gap-6 p-6 md:grid-cols-5">
                  <div className="md:col-span-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand"><Icon size={20} /></div>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{p.goal.priority} priority</div>
                          <div className="text-lg font-semibold text-ink">{p.goal.name}</div>
                        </div>
                      </div>
                      {onTrackBadge(p)}
                    </div>
                    <div className="mt-5 flex items-baseline justify-between">
                      <div className="tabular text-2xl font-semibold text-ink">{eur(p.goal.currentAmount)} <span className="text-base font-normal text-muted">/ {eur(p.goal.targetAmount)}</span></div>
                      <div className="tabular text-lg font-semibold text-brand">{Math.round(p.progress * 100)}%</div>
                    </div>
                    <div className="mt-2"><ProgressBar value={p.progress} height="h-2.5" ticks={p.goal.milestoneAmounts.slice(0, -1).map((m) => m / p.goal.targetAmount)} tone={p.goal.type === "emergency" ? "growth" : "brand"} /></div>
                    <ProjectionTimeline today={ctx.today} target={p.goal.targetDate} projected={p.projectedDate} />
                    <div className="mt-5 grid grid-cols-3 gap-4 text-[13px]">
                      <div><div className="text-muted">Monthly</div><div className="tabular font-semibold text-ink">{eur(p.goal.monthlyContribution)}</div></div>
                      <div><div className="text-muted">Needed</div><div className="tabular font-semibold text-ink">{eur(p.requiredMonthly)}</div></div>
                      <div><div className="text-muted">Likelihood</div><div className="font-semibold text-ink">{p.likelihood}</div></div>
                    </div>
                    <p className="mt-4 text-[13px] text-slate-600">
                      You&apos;ve added <span className="font-semibold text-ink">{eur(p.last90Days)}</span> over the last 90 days. {paceText(p)}
                    </p>
                    <Link href={`/goals/${p.goal.id}`} className="mt-3 inline-block text-[13px] font-medium text-brand hover:underline">Explore scenarios</Link>
                  </div>
                  <div className="rounded-2xl bg-surface p-5 md:col-span-2">
                    <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted">Journey</div>
                    <GoalJourney p={p} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </WithSnapshot>
  );
}
