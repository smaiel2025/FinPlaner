"use client";

import { ArrowRight } from "lucide-react";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { useTenant } from "@/components/providers/TenantProvider";
import { Card, SectionTitle } from "@/components/ui/primitives";

const PIPELINE = [
  { label: "Signals", detail: "Transactions, balances, bills, goals" },
  { label: "Profile", detail: "Income, essentials, buffer, behaviour" },
  { label: "Detectors", detail: "Pluggable rules per opportunity type" },
  { label: "Relevance", detail: "Impact, urgency, goals, confidence" },
  { label: "Next best action", detail: "Options with trade-offs" },
  { label: "Channel", detail: "App by default, messaging if urgent" },
  { label: "Approval", detail: "Customer decides, then execute" },
  { label: "Progress", detail: "Score, milestones, feedback loop" },
];

const SCALING = [
  { concern: "Trigger", poc: "Demo events + page load", prod: "Event stream (transaction posted, invoice, salary) per customer" },
  { concern: "Evaluation", poc: "Full recompute for one customer", prod: "Incremental: only detectors subscribed to the event type run" },
  { concern: "Features", poc: "Derived in memory", prod: "Feature store with daily aggregates + streaming deltas" },
  { concern: "Gating", poc: "Relevance threshold + anti-spam rules", prod: "Same rules, plus global contact caps and A/B-tested thresholds" },
  { concern: "Language", poc: "Deterministic templates, optional LLM", prod: "LLM only when a customer opens or asks - never for scoring" },
  { concern: "Delivery", poc: "Simulated WhatsApp", prod: "Channel gateway with consent registry and delivery receipts" },
];

const MATHS = [
  ["Customers", "2.3M"],
  ["Relevant events / customer / day (assumed)", "~1.5"],
  ["Deterministic evaluations / day", "~3.5M (~40/s, peaks ~400/s on salary days)"],
  ["Surfaced insights (assumed ~3% of evaluations)", "~100K / day"],
  ["LLM calls (only when a customer chats, ~5% weekly)", "~16K / day"],
];

export function Architecture() {
  const { snapshot } = useCopilot();
  const name = snapshot?.context.profile.firstName ?? "the customer";
  return (
    <Card className="p-6">
      <SectionTitle title="Intelligence pipeline" subtitle={`Every recommendation passes each stage. The trace below shows it for ${name}.`} />
      <div className="flex flex-wrap items-stretch gap-2">
        {PIPELINE.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-[128px] rounded-xl border border-line bg-surface px-3 py-2.5">
              <div className="text-[13px] font-semibold text-ink">{s.label}</div>
              <div className="text-[11px] leading-snug text-muted">{s.detail}</div>
            </div>
            {i < PIPELINE.length - 1 && <ArrowRight size={14} className="text-slate-300" />}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function Scalability() {
  const { tenant } = useTenant();
  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card className="overflow-x-auto p-6">
        <SectionTitle title="From POC to 2.3M customers" subtitle="Event-driven: nothing runs unless something changed for that customer." />
        <table className="w-full text-left text-[13px]">
          <thead className="text-[11px] uppercase tracking-wide text-muted">
            <tr><th className="py-2 pr-4 font-medium">Concern</th><th className="py-2 pr-4 font-medium">This POC</th><th className="py-2 font-medium">Production</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {SCALING.map((r) => (
              <tr key={r.concern}><td className="py-2.5 pr-4 font-medium text-ink">{r.concern}</td><td className="py-2.5 pr-4 text-muted">{r.poc}</td><td className="py-2.5 text-ink">{r.prod}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="p-6">
        <SectionTitle title="Hybrid AI: why it scales" />
        <div className="mb-4 grid grid-cols-2 gap-2 text-[12px]">
          <div className="rounded-xl bg-brand-50 p-3"><div className="font-semibold text-brand">Deterministic engine</div><div className="mt-1 text-slate-600">Every number, score, forecast and eligibility decision. Cheap, auditable, testable.</div></div>
          <div className="rounded-xl bg-surface p-3"><div className="font-semibold text-ink">Language model</div><div className="mt-1 text-slate-600">Phrasing and intent understanding only, on minimal facts. Optional.</div></div>
        </div>
        <dl className="divide-y divide-line text-[13px]">
          {MATHS.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 py-2"><dt className="text-muted">{k}</dt><dd className="tabular text-right font-medium text-ink">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] text-muted">Illustrative assumptions for sizing, not measured {tenant.bankName} figures.</p>
      </Card>
    </div>
  );
}
