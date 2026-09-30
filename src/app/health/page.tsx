"use client";

import { Info } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FactorList } from "@/components/health/FactorList";
import { MomentumIndicator, ScoreChange } from "@/components/health/Momentum";
import { ScoreRing } from "@/components/health/ScoreRing";
import { PageHeader, WithSnapshot } from "@/components/ui/PageStates";
import { Card, SectionTitle } from "@/components/ui/primitives";
import { monthLabel } from "@/lib/utils/format";

export default function HealthPage() {
  return (
    <WithSnapshot>
      {({ context: ctx }) => {
        const h = ctx.health;
        const history = h.history.map((x) => ({ ...x, label: monthLabel(x.month) }));
        return (
          <div>
            <PageHeader title="Financial health & momentum" subtitle="A personal progress indicator that explains itself. It is not a credit score and says nothing about your worth - it only helps you see direction." />
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="relative overflow-hidden bg-gradient-to-br from-ink to-ink-soft p-6 text-white">
                <div className="text-[13px] font-medium text-white/70">Financial health</div>
                <div className="mt-4 flex items-center gap-5">
                  <ScoreRing score={h.score} dark size={128} />
                  <div>
                    <div className="text-2xl font-semibold">{h.label}</div>
                    <div className="mt-1 text-[13px] text-white/80">
                      {h.change >= 0 ? "+" : ""}
                      {h.change} since last month
                    </div>
                  </div>
                </div>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="text-[12px] font-medium uppercase tracking-wide text-white/60">Momentum</div>
                  <div className="mt-2 flex items-center gap-3">
                    <MomentumIndicator momentum={ctx.momentum} dark />
                    <span className="tabular text-[13px] text-white/70">{ctx.momentum.value} / 100</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/80">{ctx.momentum.message}</p>
                </div>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <SectionTitle title="What changed this month" subtitle={`Score ${h.previous} → ${h.score}`} action={<ScoreChange change={h.change} />} />
                <div className="rounded-2xl bg-growth-50/60 p-4">
                  <div className="text-[14px] font-medium text-ink">Your score {h.change >= 0 ? "improved" : "changed"} because:</div>
                  <ul className="mt-2 space-y-1.5">
                    {h.reasons.map((r) => (
                      <li key={r} className="flex gap-2 text-[14px] text-slate-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-growth" />
                        {r[0].toUpperCase() + r.slice(1)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 h-44">
                  <ResponsiveContainer>
                    <AreaChart data={history} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0a6ed1" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#0a6ed1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#eef2f7" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                      <YAxis domain={[50, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e3e8ef", fontSize: 12 }} />
                      <Area type="monotone" dataKey="score" name="Health" stroke="#0a6ed1" strokeWidth={2.5} fill="url(#healthFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <Card className="p-6 lg:col-span-2">
                <SectionTitle title="How the score is built" subtitle="Five factors, each traceable to your own data" />
                <FactorList factors={h.factors} />
              </Card>
              <Card className="h-fit p-6">
                <div className="flex gap-3">
                  <Info size={18} className="mt-0.5 shrink-0 text-brand" />
                  <div className="space-y-3 text-[13px] leading-relaxed text-slate-600">
                    <p><span className="font-medium text-ink">Demo metric.</span> This score was designed for the hackathon prototype. It is not an official KBC metric and is never used for credit decisions.</p>
                    <p>It compares you only with your own past - never with other customers.</p>
                    <p>A temporary dip (for example after a one-off purchase) is normal and says nothing about you.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      }}
    </WithSnapshot>
  );
}
