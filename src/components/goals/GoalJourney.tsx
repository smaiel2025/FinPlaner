"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { Check, Flag } from "lucide-react";
import type { GoalProjection } from "@/lib/types/intelligence";
import { eur, monthYear } from "@/lib/utils/format";
import { GOAL_ICON } from "./goalMeta";

/** Vertical milestone journey: Start -> milestones -> goal. */
export function GoalJourney({ p }: { p: GoalProjection }) {
  const Icon = GOAL_ICON[p.goal.type];
  const steps = p.goal.milestoneAmounts;
  const reachedIndex = steps.filter((s) => s <= p.goal.currentAmount).length - 1;

  return (
    <ol className="relative ml-3">
      <li className="relative pb-5 pl-8">
        <span className="absolute left-0 top-0 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full bg-ink text-white">
          <Flag size={12} />
        </span>
        <span className="absolute left-0 top-6 h-full w-px -translate-x-1/2 bg-growth/50" />
        <div className="text-[13px] font-medium text-ink">Start</div>
        <div className="text-[12px] text-muted">Goal created {monthYear(p.goal.createdAt)}</div>
      </li>
      {steps.map((amount, i) => {
        const reached = i <= reachedIndex;
        const isNext = i === reachedIndex + 1;
        const isLast = i === steps.length - 1;
        return (
          <motion.li key={amount} className={clsx("relative pl-8", !isLast && "pb-5")} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}>
            <span
              className={clsx(
                "absolute left-0 top-0 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border-2",
                reached ? "border-growth bg-growth text-white" : isNext ? "border-brand bg-white text-brand" : "border-slate-200 bg-white text-slate-400",
                isNext && "milestone-glow",
              )}
            >
              {reached ? <Check size={12} strokeWidth={3} /> : isLast ? <Icon size={11} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            {!isLast && <span className={clsx("absolute left-0 top-6 h-full w-px -translate-x-1/2", reached ? "bg-growth/50" : "bg-slate-200")} />}
            <div className="flex items-baseline gap-2">
              <span className={clsx("tabular text-[13px] font-medium", reached ? "text-ink" : "text-slate-500")}>
                {isLast ? `${eur(amount)} - goal reached` : eur(amount)}
              </span>
              {isNext && <span className="text-[11px] font-medium text-brand">Next milestone</span>}
            </div>
            {isNext && (
              <div className="text-[12px] text-muted">
                {eur(amount - p.goal.currentAmount)} to go
                {p.goal.monthlyContribution > 0 && ` · about ${Math.ceil((amount - p.goal.currentAmount) / p.goal.monthlyContribution)} months`}
              </div>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}
