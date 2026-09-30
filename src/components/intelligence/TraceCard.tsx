"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/primitives";
import type { ScoredOpportunity } from "@/lib/types/intelligence";

const FACTORS = [
  { id: "impact", label: "Impact", weight: 0.35 },
  { id: "urgency", label: "Urgency", weight: 0.25 },
  { id: "goalRelevance", label: "Goal relevance", weight: 0.25 },
  { id: "confidence", label: "Confidence", weight: 0.15 },
] as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[140px_1fr]">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="text-[13px] text-ink">{children}</div>
    </div>
  );
}

/** Full decision trace for one opportunity: event, signals, scoring, action, channel. */
export function TraceCard({ trace, defaultOpen }: { trace: ScoredOpportunity; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const r = trace.relevance;
  return (
    <div className={clsx("rounded-2xl border bg-white", r.surfaced ? "border-brand/30" : "border-line")}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <div className="tabular grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface text-[15px] font-semibold text-ink">{r.score}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium text-ink">{trace.title}</div>
          <div className="truncate text-[12px] text-muted">{trace.key} · {trace.type}</div>
        </div>
        {r.surfaced ? (
          <Badge tone={trace.channel === "whatsapp" ? "positive" : "brand"}>Surfaced · {trace.channel}</Badge>
        ) : (
          <Badge tone="neutral">Suppressed</Badge>
        )}
        <ChevronDown size={16} className={clsx("shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="divide-y divide-line border-t border-line px-5 pb-3">
          <Row label="Event">{trace.event}</Row>
          <Row label="Signals">
            <ul className="space-y-0.5">{trace.signals.map((s) => <li key={s.id}>{s.value ? <><span className="text-muted">{s.label}:</span> {s.value}</> : s.label}</li>)}</ul>
          </Row>
          <Row label="Context">{trace.context.join(" · ")}</Row>
          <Row label="Relevance">
            <div className="space-y-1.5">
              {FACTORS.map((f) => (
                <div key={f.id} className="flex items-center gap-3">
                  <span className="w-28 text-[12px] text-muted">{f.label} ×{f.weight}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${r[f.id]}%` }} /></div>
                  <span className="tabular w-8 text-right text-[12px]">{r[f.id]}</span>
                </div>
              ))}
              <div className="pt-1 text-[12px] text-muted">
                Score <span className="font-semibold text-ink">{r.score}</span> vs threshold {r.threshold}
                {r.frequencyPenalty > 0 && <> · messaging score {r.messagingScore} after {r.frequencyPenalty}% frequency penalty</>}
              </div>
              {r.suppressionReason && <div className="text-[12px] text-attention">Suppressed: {r.suppressionReason}</div>}
            </div>
          </Row>
          <Row label="Next best action">{trace.nextBestAction}</Row>
          <Row label="Actions offered">{trace.actions.map((a) => a.label).join(" · ") || "-"}</Row>
          <Row label="Channel">{trace.channel} - {trace.channelReason}</Row>
          <Row label="Why now">{trace.whyNow}</Row>
        </div>
      )}
    </div>
  );
}
