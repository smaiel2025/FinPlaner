"use client";

import Link from "next/link";
import { FinancialSnapshot } from "@/components/dashboard/FinancialSnapshot";
import { HealthSummary } from "@/components/dashboard/HealthSummary";
import { HeroAssistant } from "@/components/dashboard/HeroAssistant";
import { RecentProgress } from "@/components/dashboard/RecentProgress";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { GoalCard } from "@/components/goals/GoalCard";
import { InsightCard } from "@/components/insights/InsightCard";
import { WithSnapshot } from "@/components/ui/PageStates";
import { Card, SectionTitle } from "@/components/ui/primitives";

export default function DashboardPage() {
  return (
    <WithSnapshot>
      {(snapshot) => {
        const ctx = snapshot.context;
        const milestone = ctx.feed.find((o) => o.type === "milestone");
        const actions = ctx.feed.filter((o) => o.type !== "milestone").slice(0, 2);
        return (
          <div className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <HeroAssistant snapshot={snapshot} />
              </div>
              <HealthSummary health={ctx.health} momentum={ctx.momentum} />
            </div>

            {milestone && <InsightCard opp={milestone} />}

            <section>
              <SectionTitle title="Your goals" action={<Link href="/goals" className="text-[13px] font-medium text-brand hover:underline">Goal journeys</Link>} />
              <div className="grid gap-4 md:grid-cols-3">
                {ctx.projections.map((p) => (
                  <GoalCard key={p.goal.id} p={p} highlight={milestone?.relatedGoalId === p.goal.id} />
                ))}
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <SectionTitle
                  title="Recommended for you"
                  subtitle="Only what passed your relevance threshold"
                  action={<Link href="/insights" className="text-[13px] font-medium text-brand hover:underline">All insights</Link>}
                />
                <div className="space-y-4">
                  {actions.length ? actions.map((o, i) => <InsightCard key={o.key} opp={o} featured={i === 0} />) : (
                    <Card className="p-6 text-[14px] text-muted">Nothing needs your attention right now. We&apos;ll let you know when something meaningful changes.</Card>
                  )}
                </div>
              </section>
              <FinancialSnapshot ctx={ctx} />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <RecentProgress ctx={ctx} />
              <Card className="p-6 lg:col-span-2">
                <SectionTitle title="Where your money went" subtitle="Last 6 months" />
                <SpendingChart series={ctx.financial.monthlySpendingSeries} />
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <UpcomingPayments forecast={ctx.forecast} />
              </div>
              <Card className="p-6">
                <SectionTitle title="What we understand" subtitle="Recent changes in your finances" />
                <ul className="space-y-2.5 text-[13px] text-slate-700">
                  {ctx.financial.behaviorChanges.slice(0, 5).map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky" />
                      {b}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        );
      }}
    </WithSnapshot>
  );
}
