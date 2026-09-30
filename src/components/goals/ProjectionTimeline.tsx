"use client";

import { motion } from "framer-motion";
import type { ISODate } from "@/lib/types/domain";
import { monthsBetween } from "@/lib/utils/dates";
import { monthYear } from "@/lib/utils/format";

/**
 * Horizontal timeline: today -> target date, with the projected date marker.
 * When `previous` is given, the marker glides from the old projection to the new one.
 */
export function ProjectionTimeline({
  today,
  target,
  projected,
  previous,
  compact = false,
}: {
  today: ISODate;
  target: ISODate;
  projected: ISODate | null;
  previous?: ISODate | null;
  compact?: boolean;
}) {
  const dates = [target, projected, previous].filter(Boolean) as ISODate[];
  const span = Math.max(...dates.map((d) => monthsBetween(today, d))) * 1.08 || 1;
  const pos = (d: ISODate) => `${Math.max(0, Math.min(100, (monthsBetween(today, d) / span) * 100))}%`;
  const ahead = projected ? projected <= target : false;

  return (
    <div className={compact ? "pt-5" : "pt-7"}>
      <div className="relative h-1.5 rounded-full bg-slate-100">
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand-100" style={{ width: pos(target) }} />
        <div className="absolute -top-6 -translate-x-1/2 text-center" style={{ left: pos(target) }}>
          <div className="whitespace-nowrap text-[11px] font-medium text-muted">Target</div>
        </div>
        <span className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-ink/60" style={{ left: pos(target) }} />
        {previous && previous !== projected && (
          <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-slate-300 bg-white" style={{ left: pos(previous) }} />
        )}
        {projected && (
          <motion.span
            className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow ${ahead ? "bg-growth" : "bg-attention"}`}
            initial={{ left: previous ? pos(previous) : pos(projected) }}
            animate={{ left: pos(projected) }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        )}
      </div>
      <div className="mt-2.5 flex justify-between text-[11px] text-muted">
        <span>Today</span>
        <span>
          Target <span className="font-medium text-ink">{monthYear(target)}</span>
          {" · "}Projected{" "}
          <span className={`font-medium ${ahead ? "text-growth" : "text-attention"}`}>{monthYear(projected)}</span>
        </span>
      </div>
    </div>
  );
}
