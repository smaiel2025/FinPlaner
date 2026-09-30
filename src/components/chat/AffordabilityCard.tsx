"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { AffordabilityResult } from "@/lib/engine/simulate";
import { eur, monthYear, weeksPhrase } from "@/lib/utils/format";

/** Trade-off options plotted against the primary goal's timeline. */
export function AffordabilityCard({ result }: { result: AffordabilityResult }) {
  const maxWeeks = Math.max(8, ...result.options.map((o) => o.delayWeeks));
  return (
    <div className="space-y-3">
      <div className="grid gap-2.5 sm:grid-cols-3">
        {result.options.map((o, i) => (
          <motion.div
            key={o.amount}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={clsx("rounded-2xl border p-4", o.noImpact ? "border-growth/30 bg-growth-50/50" : "border-line bg-white")}
          >
            <div className="text-[12px] text-muted">{result.purpose === "purchase" ? "Spend" : result.purpose[0].toUpperCase() + result.purpose.slice(1)}</div>
            <div className="tabular text-xl font-semibold text-ink">{eur(o.amount)}</div>
            <div className={clsx("mt-2 text-[13px] font-medium", o.noImpact ? "text-growth" : "text-attention")}>
              {o.noImpact ? "No meaningful impact" : `Goal delayed ${weeksPhrase(o.delayWeeks)}`}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <motion.div className={clsx("h-full rounded-full", o.noImpact ? "bg-growth" : "bg-attention")} initial={{ width: 0 }} animate={{ width: `${Math.max(4, (o.delayWeeks / maxWeeks) * 100)}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }} />
            </div>
            <div className="mt-2 text-[11px] text-muted">{result.primaryGoal.name}: {monthYear(o.impact.projectedAfter)}</div>
          </motion.div>
        ))}
      </div>
      <div className="rounded-xl bg-surface px-3.5 py-3 text-[12px] leading-relaxed text-slate-600">
        <span className="font-medium text-ink">How I checked this: </span>
        {result.signals.join(" · ")}. Up to {eur(result.capacity)} can come from your balance and unallocated surplus over the coming months without touching your goals; anything above that pauses your {result.primaryGoal.name.toLowerCase()} contributions.
      </div>
    </div>
  );
}
