"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FinancialProfile } from "@/lib/types/intelligence";
import { eur, monthLabel } from "@/lib/utils/format";

export function SpendingChart({ series }: { series: FinancialProfile["monthlySpendingSeries"] }) {
  const data = series.map((s) => ({ ...s, label: monthLabel(s.month) }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barSize={22}>
          <CartesianGrid vertical={false} stroke="#eef2f7" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `€${v / 1000}k`} />
          <Tooltip formatter={(v) => eur(Number(v))} cursor={{ fill: "rgba(10,110,209,0.05)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e3e8ef", fontSize: 12 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="essential" name="Essentials" stackId="a" fill="#1d3557" />
          <Bar dataKey="discretionary" name="Flexible" stackId="a" fill="#22b5e8" />
          <Bar dataKey="saved" name="To goals" stackId="a" fill="#0f9d77" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
