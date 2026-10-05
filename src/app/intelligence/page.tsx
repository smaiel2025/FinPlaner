"use client";

import { useEffect, useState } from "react";
import { Architecture, Scalability } from "@/components/intelligence/Architecture";
import { TraceCard } from "@/components/intelligence/TraceCard";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { PageHeader } from "@/components/ui/PageStates";
import { Badge, Card, SectionTitle, Skeleton, Stat } from "@/components/ui/primitives";
import { api } from "@/lib/api/client";
import type { EventRecord, FeedbackRecord, NotificationRecord } from "@/lib/types/domain";
import type { ScoredOpportunity } from "@/lib/types/intelligence";

interface IntelligenceData {
  today: string;
  traces: ScoredOpportunity[];
  detectors: string[];
  thresholds: Record<string, number>;
  activeThreshold: number;
  events: EventRecord[];
  notifications: NotificationRecord[];
  feedback: FeedbackRecord[];
  ai: { mode: string; provider: string };
}

export default function IntelligencePage() {
  const { version, notify, snapshot } = useCopilot();
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [threshold, setThreshold] = useState<number | null>(null);

  useEffect(() => {
    const q = threshold === null ? "" : `?threshold=${threshold}`;
    api<IntelligenceData>(`/api/intelligence${q}`)
      .then(setData)
      .catch((e) => notify(e.message, "risk"));
  }, [threshold, version, notify]);

  if (!data) return <div className="mx-auto max-w-6xl space-y-4"><Skeleton className="h-24" /><Skeleton className="h-96" /></div>;

  const name = snapshot?.context.profile.firstName ?? "the customer";
  const traces = data.traces.filter((t) => t.type !== "contextual_decision" || t.relevance.surfaced);
  const surfaced = traces.filter((t) => t.relevance.surfaced);
  const bundled = traces.filter((t) => t.bundledInto).length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Intelligence view"
        subtitle={`Behind the scenes: how the Co-Pilot decided what ${name} sees. Internal / demo only.`}
        action={<Badge tone="neutral">AI: {data.ai.mode}</Badge>}
      />

      <Architecture />

      <Card className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Detectors" value={data.detectors.length} hint="pluggable rules" />
        <Stat label="Findings" value={traces.length} hint={`for ${name} right now`} />
        <Stat label="Surfaced" value={surfaced.length} hint={`at threshold ${data.activeThreshold}`} />
        <Stat label="Merged" value={bundled} hint="bundled into one action" />
        <Stat label="Messages sent" value={data.notifications.length} hint="outside the app" />
      </Card>

      <Card className="p-6">
        <SectionTitle
          title="Relevance threshold"
          subtitle="Preview only: move the gate and watch what would surface. Customer settings map to minimal 80, balanced 65, proactive 50."
          action={threshold !== null && <button onClick={() => setThreshold(null)} className="text-[13px] text-brand hover:underline">Reset to customer setting</button>}
        />
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={30}
            max={95}
            value={threshold ?? data.activeThreshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="flex-1 accent-[var(--color-brand)]"
            aria-label="Relevance threshold"
          />
          <span className="tabular w-10 text-right text-lg font-semibold text-ink">{threshold ?? data.activeThreshold}</span>
        </div>
      </Card>

      <div>
        <SectionTitle title="Decision traces" subtitle="Sorted by relevance. Open any row for the full reasoning chain." />
        <div className="space-y-2.5">
          {traces.map((t, i) => <TraceCard key={t.key} trace={t} defaultOpen={i === 0} />)}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <SectionTitle title="Event log" />
          {data.events.length ? (
            <ul className="divide-y divide-line text-[13px]">
              {data.events.map((e) => <li key={e.id} className="flex justify-between gap-3 py-2"><span className="text-ink">{e.label}</span><span className="shrink-0 text-muted">{e.date}</span></li>)}
            </ul>
          ) : <p className="text-[13px] text-muted">No events yet. Use the demo director to fire one.</p>}
        </Card>
        <Card className="p-6">
          <SectionTitle title="Customer feedback" />
          {data.feedback.length ? (
            <ul className="divide-y divide-line text-[13px]">
              {data.feedback.map((f) => <li key={`${f.key}-${f.date}-${f.outcome}`} className="flex justify-between gap-3 py-2"><span className="truncate text-ink">{f.key}</span><span className="shrink-0 text-muted">{f.outcome} · {f.date}</span></li>)}
            </ul>
          ) : <p className="text-[13px] text-muted">No approvals or dismissals yet. Feedback lowers or blocks future suggestions.</p>}
        </Card>
      </div>

      <Scalability />
    </div>
  );
}
