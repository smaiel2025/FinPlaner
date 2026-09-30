"use client";

import clsx from "clsx";
import { AlertTriangle, Award, Info, Lightbulb, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { Badge, Button, Card } from "@/components/ui/primitives";
import type { ScoredOpportunity, Tone } from "@/lib/types/intelligence";

const TONE: Record<Tone, { icon: typeof Info; chip: string; label: string }> = {
  risk: { icon: AlertTriangle, chip: "bg-risk-50 text-risk", label: "Heads-up" },
  opportunity: { icon: Lightbulb, chip: "bg-brand-50 text-brand", label: "Opportunity" },
  positive: { icon: Award, chip: "bg-growth-50 text-growth", label: "Progress" },
  info: { icon: Info, chip: "bg-slate-100 text-slate-600", label: "Insight" },
};

export function InsightCard({ opp, featured = false }: { opp: ScoredOpportunity; featured?: boolean }) {
  const { openWhy, openReview, feedback, approve } = useCopilot();
  const [menu, setMenu] = useState(false);
  const t = TONE[opp.tone];
  const Icon = t.icon;
  const hasActions = opp.actions.some((a) => a.kind !== "info");
  const isMilestone = opp.type === "milestone";

  return (
    <Card className={clsx("relative p-5", featured && "ring-1 ring-brand/20", isMilestone && "milestone-glow")}>
      <div className="flex items-start gap-3">
        <div className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", t.chip)}>
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge tone={opp.tone === "risk" ? "risk" : opp.tone === "positive" ? "positive" : opp.tone === "opportunity" ? "brand" : "neutral"}>{t.label}</Badge>
            {opp.estimatedImpact && !isMilestone && <span className="text-[12px] text-muted">{opp.estimatedImpact}</span>}
          </div>
          <h3 className="text-[15px] font-semibold leading-snug text-ink">{opp.title}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{opp.summary}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {isMilestone ? (
              <Link href={opp.relatedGoalId ? `/goals/${opp.relatedGoalId}` : "/progress"}>
                <Button size="sm" variant="secondary" onClick={() => opp.actions[0] && void approve(opp.key, [opp.actions[0].id])}>See my progress</Button>
              </Link>
            ) : hasActions ? (
              <>
                <Button size="sm" onClick={() => openReview(opp)}>Review</Button>
                <Button size="sm" variant="quiet" onClick={() => feedback(opp.key, "dismissed")}>Not now</Button>
              </>
            ) : (
              <Button size="sm" variant="quiet" onClick={() => feedback(opp.key, "dismissed")}>Dismiss</Button>
            )}
            <button className="ml-auto text-[12px] font-medium text-brand hover:underline" onClick={() => openWhy(opp)}>
              Why am I seeing this?
            </button>
          </div>
        </div>
        <div className="relative">
          <button className="rounded-full p-1 text-slate-400 hover:bg-surface hover:text-ink" onClick={() => setMenu((m) => !m)} aria-label="More options">
            <MoreHorizontal size={16} />
          </button>
          {menu && (
            <div className="absolute right-0 top-7 z-10 w-56 rounded-xl border border-line bg-white p-1 shadow-lift">
              <button
                className="w-full rounded-lg px-3 py-2 text-left text-[13px] text-ink hover:bg-surface"
                onClick={() => {
                  setMenu(false);
                  void feedback(opp.key, "never");
                }}
              >
                Don&apos;t recommend this again
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
