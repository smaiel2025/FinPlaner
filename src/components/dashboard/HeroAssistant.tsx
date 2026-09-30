"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCopilot } from "@/components/providers/CopilotProvider";
import type { Snapshot } from "@/lib/api/snapshot";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function HeroAssistant({ snapshot }: { snapshot: Snapshot }) {
  const { openWhy } = useCopilot();
  const { briefing, context } = snapshot;
  const source = context.feed.find((o) =>
    briefing.tone === "risk" ? o.type === "cashflow_risk" : briefing.tone === "positive" ? o.type === "milestone" : o.type === "goal_deviation",
  );

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-ink-soft to-brand-600 p-6 text-white shadow-lift sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-[12px] font-medium text-white/70">
          <Sparkles size={14} className="text-sky" /> Your Financial Co-Pilot
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[28px]">
          {greeting()}, {context.profile.firstName}.
        </h1>
        <motion.p key={briefing.message} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/85">
          {briefing.message}
        </motion.p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {briefing.cta && (
            <Link href={`/copilot?q=${encodeURIComponent(briefing.cta.prompt)}`} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-ink hover:bg-brand-50">
              {briefing.cta.label} <ArrowRight size={15} />
            </Link>
          )}
          <Link href="/copilot" className="inline-flex h-10 items-center rounded-full px-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">
            Ask something else
          </Link>
          {source && (
            <button onClick={() => openWhy(source)} className="ml-auto text-[12px] font-medium text-white/60 underline-offset-2 hover:text-white hover:underline">
              Why am I seeing this?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
