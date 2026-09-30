"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { onTrackBadge } from "@/components/goals/GoalCard";
import { GoalChart } from "@/components/goals/GoalChart";
import { GoalJourney } from "@/components/goals/GoalJourney";
import { ProgressBar } from "@/components/goals/ProgressBar";
import { ProjectionTimeline } from "@/components/goals/ProjectionTimeline";
import { PageHeader, WithSnapshot } from "@/components/ui/PageStates";
import { Card, SectionTitle, Stat } from "@/components/ui/primitives";
import { goalImpact } from "@/lib/engine/goals";
import { eur, monthYear, weeksPhrase } from "@/lib/utils/format";

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [delta, setDelta] = useState(0);

  return (
    <WithSnapshot>
      {({ context: ctx }) => {
        const p = ctx.projections.find((x) => x.goal.id === id);
        if (!p) return <Card className="p-6">Goal not found. <Link href="/goals" className="text-brand">Back to goals</Link></Card>;
        const impact = goalImpact(p.goal, ctx.today, { monthlyDelta: delta });
        const milestones = ctx.milestones.filter((m) => m.goalId === p.goal.id);
        return (
          <div>
            <Link href="/goals" className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink"><ArrowLeft size={14} /> Goals</Link>
            <PageHeader title={p.goal.name} subtitle={`Target ${eur(p.goal.targetAmount)} by ${monthYear(p.goal.targetDate)}`} action={onTrackBadge(p)} />
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="p-6 lg:col-span-2">
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                  <Stat label="Saved" value={eur(p.goal.currentAmount)} hint={`${Math.round(p.progress * 100)}% complete`} />
                  <Stat label="Monthly" value={eur(p.goal.monthlyContribution)} hint={`Needed ${eur(p.requiredMonthly)}`} />
                  <Stat label="Projected" value={monthYear(p.projectedDate)} />
                  <Stat label="Likelihood" value={p.likelihood} hint="Demo estimate" />
                </div>
                <div className="mt-5"><ProgressBar value={p.progress} height="h-2.5" /></div>
                <div className="mt-6"><GoalChart goal={p.goal} today={ctx.today} monthly={p.goal.monthlyContribution + delta} /></div>
              </Card>
              <Card className="p-6">
                <SectionTitle title="Journey" subtitle={`${milestones.length} milestone${milestones.length === 1 ? "" : "s"} reached`} />
                <GoalJourney p={p} />
              </Card>
            </div>

            <Card className="mt-5 p-6">
              <SectionTitle title="What if I change my monthly contribution?" subtitle="Simulation only - nothing changes until you approve something." />
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-muted">Change per month</span>
                    <span className="tabular text-lg font-semibold text-ink">{delta >= 0 ? "+" : ""}{eur(delta)}</span>
                  </div>
                  <input
                    type="range"
                    min={-200}
                    max={400}
                    step={10}
                    value={delta}
                    onChange={(e) => setDelta(Number(e.target.value))}
                    className="mt-3 w-full accent-[#0a6ed1]"
                    aria-label="Monthly contribution change"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-muted"><span>-€200</span><span>+€400</span></div>
                  <p className="mt-4 text-[14px] text-slate-700">
                    {delta === 0
                      ? "Move the slider to see how your timeline responds."
                      : `At ${eur(p.goal.monthlyContribution + delta)}/month you'd reach your goal in ${monthYear(impact.projectedAfter)} - ${weeksPhrase(impact.weeksShift)} ${impact.weeksShift >= 0 ? "earlier" : "later"}.`}
                  </p>
                </div>
                <ProjectionTimeline today={ctx.today} target={p.goal.targetDate} projected={impact.projectedAfter} previous={delta ? p.projectedDate : undefined} />
              </div>
            </Card>
          </div>
        );
      }}
    </WithSnapshot>
  );
}
