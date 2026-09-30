"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { CalendarCheck, Check, Circle, Sparkle } from "lucide-react";
import { PageHeader, WithSnapshot } from "@/components/ui/PageStates";
import { Card, SectionTitle } from "@/components/ui/primitives";
import { eur, monthYear } from "@/lib/utils/format";

export default function ProgressPage() {
  return (
    <WithSnapshot>
      {({ context: ctx }) => {
        const milestones = [...ctx.milestones].sort((a, b) => b.reachedOn.localeCompare(a.reachedOn));
        const goalName = (id: string) => ctx.projections.find((p) => p.goal.id === id)?.goal.name ?? "";
        return (
          <div>
            <PageHeader
              title="Your progress"
              subtitle="Recognition for real financial outcomes - never for time spent in the app. Compared only with your own history."
            />

            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="p-6 lg:col-span-2">
                <SectionTitle title="Milestones" subtitle="Meaningful points on your goal journeys" />
                <ol className="space-y-3">
                  {milestones.map((m, i) => (
                    <motion.li key={m.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 rounded-2xl border border-line p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-growth-50 text-growth"><Check size={16} strokeWidth={2.5} /></span>
                      <div className="flex-1">
                        <div className="text-[14px] font-medium text-ink">{goalName(m.goalId)} · {m.label}</div>
                        <div className="text-[12px] text-muted">{eur(m.amount)} reached · {monthYear(m.reachedOn)}</div>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </Card>

              <Card className="p-6">
                <SectionTitle title="Consistency" subtitle="You stayed within your planned range" />
                <ul className="space-y-4">
                  {ctx.streaks.map((s) => (
                    <li key={s.id} className="flex gap-3">
                      <CalendarCheck size={18} className="mt-0.5 shrink-0 text-brand" />
                      <div>
                        <div className="text-[14px] font-medium text-ink">{s.label}</div>
                        <div className="text-[12px] text-muted">{s.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 rounded-xl bg-surface p-3 text-[12px] leading-relaxed text-muted">
                  A pause never resets your progress. Life happens - spending on what matters is part of a healthy plan.
                </p>
              </Card>
            </div>

            <section className="mt-6">
              <SectionTitle title="Achievements" subtitle="Real financial behaviours, acknowledged quietly" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {ctx.achievements.map((a) => (
                  <Card key={a.id} className={clsx("p-5", !a.earned && "bg-white/60 shadow-none")}>
                    <div className="flex items-center justify-between">
                      <span className={clsx("grid h-8 w-8 place-items-center rounded-full", a.earned ? "bg-ink text-white" : "border border-dashed border-slate-300 text-slate-300")}>
                        {a.earned ? <Sparkle size={14} /> : <Circle size={10} />}
                      </span>
                      {a.earned && a.earnedOn && <span className="text-[11px] text-muted">Since {monthYear(`${a.earnedOn}-01`)}</span>}
                    </div>
                    <div className={clsx("mt-3 text-[14px] font-semibold", a.earned ? "text-ink" : "text-slate-500")}>{a.title}</div>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">{a.description}</p>
                    {a.progressText && <div className={clsx("mt-3 text-[12px] font-medium", a.earned ? "text-growth" : "text-slate-400")}>{a.progressText}</div>}
                  </Card>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <SectionTitle title="Personal bests" subtitle="You versus your own past" />
              <div className="grid gap-4 md:grid-cols-3">
                {ctx.personalBests.map((b) => (
                  <Card key={b.id} className="p-5">
                    <div className="text-[14px] font-semibold text-ink">{b.label}</div>
                    <p className="mt-1 text-[13px] text-slate-600">{b.detail}</p>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        );
      }}
    </WithSnapshot>
  );
}
