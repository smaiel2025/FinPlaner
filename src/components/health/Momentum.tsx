import clsx from "clsx";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Momentum } from "@/lib/types/intelligence";

export function MomentumIndicator({ momentum, dark = false }: { momentum: Momentum; dark?: boolean }) {
  const Icon = momentum.state === "Improving" ? ArrowUpRight : momentum.state === "Slowing" ? ArrowDownRight : ArrowRight;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium",
        momentum.state === "Improving" && (dark ? "bg-growth/20 text-emerald-300" : "bg-growth-50 text-growth"),
        momentum.state === "Steady" && (dark ? "bg-white/10 text-white" : "bg-brand-50 text-brand"),
        momentum.state === "Slowing" && (dark ? "bg-attention/20 text-amber-300" : "bg-attention-50 text-attention"),
      )}
    >
      <Icon size={14} /> {momentum.state}
    </span>
  );
}

export function ScoreChange({ change }: { change: number }) {
  if (change === 0) return <span className="text-[12px] text-muted">No change this month</span>;
  return (
    <span className={clsx("tabular text-[12px] font-medium", change > 0 ? "text-growth" : "text-attention")}>
      {change > 0 ? "+" : ""}
      {change} this month
    </span>
  );
}
