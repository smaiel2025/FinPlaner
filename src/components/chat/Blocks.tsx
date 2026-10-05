"use client";

import { Brain, CalendarClock, CircleCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { GoalCard } from "@/components/goals/GoalCard";
import { FactorList } from "@/components/health/FactorList";
import { InsightCard } from "@/components/insights/InsightCard";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { useTenant } from "@/components/providers/TenantProvider";
import { Button } from "@/components/ui/primitives";
import { api } from "@/lib/api/client";
import type { ChatBlock } from "@/lib/types/chat";
import type { ScoredOpportunity } from "@/lib/types/intelligence";
import { eur, monthYear, pct } from "@/lib/utils/format";
import { AffordabilityCard } from "./AffordabilityCard";

function MemoryBlock({ block }: { block: Extract<ChatBlock, { type: "memory" }> }) {
  const { refresh, notify } = useCopilot();
  const [status, setStatus] = useState(block.fact.status);
  const resolve = async (apply: boolean) => {
    try {
      const r = await api<{ message: string }>("/api/memory", { method: "POST", json: { factId: block.fact.id, apply } });
      setStatus(apply ? "applied" : "noted");
      notify(r.message, "positive");
      await refresh();
    } catch (e) {
      notify((e as Error).message, "risk");
    }
  };
  return (
    <div className="rounded-2xl border border-brand/20 bg-brand-50/40 p-4">
      <div className="flex items-center gap-2 text-[12px] font-medium text-brand"><Brain size={14} /> Remembered from our conversation</div>
      <div className="mt-1 text-[14px] text-ink">{block.fact.fact}</div>
      {status === "pending_confirmation" && block.proposal ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => resolve(true)}>{block.proposal.label}</Button>
          <Button size="sm" variant="quiet" onClick={() => resolve(false)}>Just remember it</Button>
        </div>
      ) : (
        <div className="mt-2 text-[12px] text-muted">{status === "applied" ? "Your goal has been updated." : "Noted. You can review or delete memories in AI controls."}</div>
      )}
    </div>
  );
}

/** Chat cards are historical; show the live version, or its outcome once handled. */
function RecommendationBlock({ opp }: { opp: ScoredOpportunity }) {
  const { snapshot } = useCopilot();
  const live = snapshot?.context.opportunities.find((o) => o.key === opp.key);
  const outcome = snapshot?.context.feedback.findLast((f) => f.key === opp.key)?.outcome;
  if (!snapshot || (live && live.relevance.surfaced)) return <InsightCard opp={live ?? opp} featured />;
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-[13px] text-muted">
      <CircleCheck size={16} className={outcome === "accepted" ? "text-growth" : "text-slate-400"} />
      {opp.title} - {outcome === "accepted" ? "approved" : "no longer needs your attention"}.
    </div>
  );
}

function AdvisorBlock({ reason, onSuggest }: { reason: string; onSuggest: (text: string) => void }) {
  const { tenant } = useTenant();
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white"><UserRound size={16} /></span>
        <div>
          <div className="text-[14px] font-medium text-ink">Talk to a {tenant.advisorLabel}</div>
          <div className="text-[12px] text-muted">{reason}. Your context is shared only with your consent.</div>
        </div>
      </div>
      <Button size="sm" variant="secondary" onClick={() => onSuggest("__advisor__")}>Request a call</Button>
    </div>
  );
}

export function BlockView({ block, onSuggest }: { block: ChatBlock; onSuggest: (text: string) => void }) {
  switch (block.type) {
    case "affordability":
      return <AffordabilityCard result={block.result} />;
    case "recommendation":
      return <RecommendationBlock opp={block.opportunity} />;
    case "goalProgress":
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          {block.projections.map((p) => <GoalCard key={p.goal.id} p={p} />)}
        </div>
      );
    case "spending":
      return (
        <div className="rounded-2xl border border-line bg-white p-4">
          {block.categories.map((c) => (
            <div key={c.category} className="flex items-center justify-between border-b border-line py-2 text-[13px] last:border-0">
              <span className="capitalize text-ink">{c.category}</span>
              <span className="tabular text-muted">{eur(c.average)} → <span className="font-medium text-ink">{eur(c.thisMonth)}</span></span>
              <span className={`tabular w-14 text-right font-medium ${c.changePct > 0 ? "text-attention" : "text-growth"}`}>{c.changePct > 0 ? "+" : ""}{pct(c.changePct)}</span>
            </div>
          ))}
        </div>
      );
    case "health":
      return <div className="rounded-2xl border border-line bg-white px-4"><FactorList factors={block.health.factors} /></div>;
    case "savingsPlan": {
      const gap = block.monthlyNeeded - block.currentMonthly;
      return (
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-[12px] font-medium text-muted"><CalendarClock size={14} /> {block.goalName} by {monthYear(block.targetDate)}</div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div><div className="text-[11px] text-muted">Needed / month</div><div className="tabular text-lg font-semibold text-ink">{eur(block.monthlyNeeded)}</div></div>
            <div><div className="text-[11px] text-muted">You save now</div><div className="tabular text-lg font-semibold text-ink">{eur(block.currentMonthly)}</div></div>
            <div><div className="text-[11px] text-muted">Difference</div><div className={`tabular text-lg font-semibold ${gap > 0 ? "text-attention" : "text-growth"}`}>{gap > 0 ? `+${eur(gap)}` : "Covered"}</div></div>
          </div>
        </div>
      );
    }
    case "memory":
      return <MemoryBlock block={block} />;
    case "advisor":
      return <AdvisorBlock reason={block.reason} onSuggest={onSuggest} />;
    case "suggestions":
      return (
        <div className="flex flex-wrap gap-2">
          {block.items.map((s) => (
            <button key={s} onClick={() => onSuggest(s)} className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] text-ink hover:border-brand hover:text-brand">
              {s}
            </button>
          ))}
        </div>
      );
  }
}
