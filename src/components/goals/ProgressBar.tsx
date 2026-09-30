"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

/** Smoothly animated progress bar with optional milestone ticks. */
export function ProgressBar({
  value,
  ticks = [],
  tone = "brand",
  height = "h-2",
  previous,
}: {
  value: number; // 0-1
  ticks?: number[]; // 0-1 positions
  tone?: "brand" | "growth" | "attention";
  height?: string;
  previous?: number;
}) {
  const color = tone === "growth" ? "bg-growth" : tone === "attention" ? "bg-attention" : "bg-brand";
  return (
    <div className={clsx("relative w-full overflow-hidden rounded-full bg-slate-100", height)}>
      <motion.div
        className={clsx("absolute inset-y-0 left-0 rounded-full", color)}
        initial={{ width: `${(previous ?? 0) * 100}%` }}
        animate={{ width: `${Math.min(1, value) * 100}%` }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      {ticks.map((t) => (
        <span key={t} className="absolute inset-y-0 w-px bg-white/80" style={{ left: `${t * 100}%` }} />
      ))}
    </div>
  );
}
