"use client";

import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { projectionSeries } from "@/lib/engine/goals";
import type { Goal, ISODate } from "@/lib/types/domain";
import { eur, monthLabel } from "@/lib/utils/format";

/** Actual history (solid) + projected path (dashed) toward the target. */
export function GoalChart({ goal, today, monthly }: { goal: Goal; today: ISODate; monthly?: number }) {
  const forecast = projectionSeries(goal, today, monthly ?? goal.monthlyContribution, 60);
  const byMonth = new Map<string, { month: string; actual?: number; projected?: number }>();
  for (const h of goal.history) byMonth.set(h.month, { month: h.month, actual: h.amount });
  for (const f of forecast) byMonth.set(f.month, { ...byMonth.get(f.month), month: f.month, projected: f.amount });
  const data = [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)).map((d) => ({ ...d, label: `${monthLabel(d.month)} ${d.month.slice(2, 4)}` }));

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f9d77" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#0f9d77" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#eef2f7" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} interval="preserveStartEnd" minTickGap={28} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `€${Math.round(v / 1000)}k`} domain={[0, goal.targetAmount * 1.05]} />
          <Tooltip formatter={(v) => eur(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid #e3e8ef", fontSize: 12 }} />
          <ReferenceLine y={goal.targetAmount} stroke="#0b1f3a" strokeDasharray="4 4" label={{ value: "Target", position: "insideTopLeft", fontSize: 11, fill: "#64748b" }} />
          <Area type="monotone" dataKey="actual" name="Saved" stroke="#0f9d77" strokeWidth={2.5} fill={`url(#fill-${goal.id})`} connectNulls />
          <Line type="monotone" dataKey="projected" name="Projected" stroke="#0a6ed1" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
