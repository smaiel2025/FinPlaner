"use client";

import { ChevronDown, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { InsightCard } from "@/components/insights/InsightCard";
import { PageHeader, WithSnapshot } from "@/components/ui/PageStates";
import { Card } from "@/components/ui/primitives";

export default function InsightsPage() {
  const [showQuiet, setShowQuiet] = useState(false);
  return (
    <WithSnapshot>
      {({ context: ctx }) => {
        const quiet = ctx.opportunities.filter((o) => !o.relevance.surfaced && o.type !== "contextual_decision");
        return (
          <div className="mx-auto max-w-3xl">
            <PageHeader
              title="Insights"
              subtitle={`We analysed ${ctx.opportunities.length} signals from your accounts and only surfaced what passed your relevance threshold (${ctx.feed[0]?.relevance.threshold ?? 65}+).`}
            />
            <div className="space-y-4">
              {ctx.feed.length ? (
                ctx.feed.map((o, i) => <InsightCard key={o.key} opp={o} featured={i === 0} />)
              ) : (
                <Card className="p-8 text-center text-[14px] text-muted">All calm. Nothing needs your attention right now.</Card>
              )}
            </div>

            <div className="mt-8">
              <button onClick={() => setShowQuiet((s) => !s)} className="flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-300 px-5 py-4 text-left">
                <span className="flex items-center gap-3">
                  <EyeOff size={17} className="text-muted" />
                  <span>
                    <span className="block text-[14px] font-medium text-ink">Noticed, but not worth interrupting you ({quiet.length})</span>
                    <span className="block text-[12px] text-muted">Transparency: things we saw and deliberately kept quiet.</span>
                  </span>
                </span>
                <ChevronDown size={17} className={`text-muted transition-transform ${showQuiet ? "rotate-180" : ""}`} />
              </button>
              {showQuiet && (
                <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
                  {quiet.map((o) => (
                    <li key={o.key} className="flex items-start justify-between gap-4 px-5 py-3.5">
                      <div>
                        <div className="text-[14px] text-ink">{o.title}</div>
                        <div className="text-[12px] text-muted">{o.relevance.suppressionReason}</div>
                      </div>
                      <span className="tabular shrink-0 text-[12px] text-slate-400">{o.relevance.score}/100</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[12px] text-muted">
                Want more or fewer suggestions? Adjust frequency and topics in <Link href="/settings" className="text-brand hover:underline">AI controls</Link>.
              </p>
            </div>
          </div>
        );
      }}
    </WithSnapshot>
  );
}
