"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

/** Calm, animated ring for the Financial Health Score (demo metric). */
export function ScoreRing({ score, size = 132, stroke = 10, dark = false }: { score: number; size?: number; stroke?: number; dark?: boolean }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const value = useMotionValue(0);
  const rounded = useTransform(value, (v) => Math.round(v));
  const dash = useTransform(value, (v) => c - (v / 100) * c);

  useEffect(() => {
    const controls = animate(value, score, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [score, value]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.12)" : "#e8eef5"} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: dash }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22b5e8" />
            <stop offset="100%" stopColor="#0a6ed1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className={`tabular text-3xl font-semibold ${dark ? "text-white" : "text-ink"}`}>{rounded}</motion.span>
        <span className={`text-[11px] ${dark ? "text-white/60" : "text-muted"}`}>/ 100</span>
      </div>
    </div>
  );
}
