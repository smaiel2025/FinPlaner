"use client";

import clsx from "clsx";
import { Database, Trash2 } from "lucide-react";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { PageHeader, WithSnapshot } from "@/components/ui/PageStates";
import { Button, Card, SectionTitle, Toggle } from "@/components/ui/primitives";
import { api } from "@/lib/api/client";
import type { Frequency, Preferences, Topic } from "@/lib/types/domain";

const FREQUENCIES: { id: Frequency; label: string; hint: string }[] = [
  { id: "minimal", label: "Minimal", hint: "Only what really matters" },
  { id: "balanced", label: "Balanced", hint: "Recommended" },
  { id: "proactive", label: "Proactive", hint: "More ideas and nudges" },
];

const TOPICS: { id: Topic; label: string }[] = [
  { id: "spending", label: "Spending insights" },
  { id: "saving", label: "Saving opportunities" },
  { id: "goals", label: "Goal coaching" },
  { id: "bills", label: "Bills and cashflow" },
  { id: "insurance", label: "Insurance" },
  { id: "investing", label: "Investing" },
];

const CHANNELS: { id: keyof Preferences["channels"]; label: string }[] = [
  { id: "app", label: "KBC Mobile app" },
  { id: "web", label: "KBC Touch (web)" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
];

const DATA_USE = [
  "Transactions and balances from your KBC accounts, to detect patterns and forecast cashflow.",
  "Your goals and the preferences on this page.",
  "Facts you shared in conversation - only if memory is on, and you can delete them below.",
  "Never: data from outside KBC, your contacts, location or any third-party profiles.",
];

export default function SettingsPage() {
  const { updatePreferences, refresh, notify } = useCopilot();

  const save = async (patch: Partial<Preferences>) => {
    try {
      await updatePreferences(patch);
    } catch (e) {
      notify((e as Error).message, "risk");
    }
  };
  const call = async (path: string, init: RequestInit & { json?: unknown }, message: string) => {
    try {
      await api(path, init);
      notify(message, "positive");
      await refresh();
    } catch (e) {
      notify((e as Error).message, "risk");
    }
  };

  return (
    <WithSnapshot>
      {({ context: ctx, ai }) => {
        const p = ctx.preferences;
        const titleFor = (key: string) => ctx.opportunities.find((o) => o.key === key)?.title ?? key;
        return (
          <div className="mx-auto max-w-3xl space-y-5">
            <PageHeader title="AI controls" subtitle="You decide how, when and whether the Co-Pilot speaks up. Changes apply immediately." />

            <Card className="p-6">
              <SectionTitle title="Proactive insights" />
              <Toggle checked={p.proactiveEnabled} onChange={(v) => save({ proactiveEnabled: v })} label="Let the Co-Pilot reach out" description="When off, you only get answers when you ask." />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.id}
                    disabled={!p.proactiveEnabled}
                    onClick={() => save({ frequency: f.id })}
                    className={clsx("rounded-xl border px-3 py-2.5 text-left transition-colors disabled:opacity-50", p.frequency === f.id ? "border-brand bg-brand-50" : "border-line hover:border-slate-300")}
                  >
                    <div className="text-[14px] font-medium text-ink">{f.label}</div>
                    <div className="text-[12px] text-muted">{f.hint}</div>
                  </button>
                ))}
              </div>
              <div className="mt-2 divide-y divide-line">
                <Toggle checked={p.milestoneNotifications} onChange={(v) => save({ milestoneNotifications: v })} label="Milestone celebrations" description="Tell me when I reach a meaningful goal milestone." />
                <Toggle checked={p.progressReminders} onChange={(v) => save({ progressReminders: v })} label="Progress reminders" description="An occasional check-in on goals that drift." />
              </div>
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              <Card className="p-6">
                <SectionTitle title="Topics" />
                <div className="divide-y divide-line">
                  {TOPICS.map((t) => (
                    <Toggle key={t.id} checked={p.topics[t.id]} onChange={(v) => save({ topics: { ...p.topics, [t.id]: v } })} label={t.label} />
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <SectionTitle title="Channels" />
                <div className="divide-y divide-line">
                  {CHANNELS.map((c) => (
                    <Toggle key={c.id} checked={p.channels[c.id]} onChange={(v) => save({ channels: { ...p.channels, [c.id]: v } })} label={c.label} />
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <SectionTitle title="Consent" subtitle="Switching these off immediately limits what the Co-Pilot can do." />
              <div className="divide-y divide-line">
                <Toggle checked={p.consent.transactionAnalysis} onChange={(v) => save({ consent: { ...p.consent, transactionAnalysis: v } })} label="Analyse my transactions" description="Required for proactive insights. Without it, only explicit questions are answered." />
                <Toggle checked={p.consent.conversationMemory} onChange={(v) => save({ consent: { ...p.consent, conversationMemory: v } })} label="Remember what I tell the Co-Pilot" description="For example a new target date for a goal." />
                <Toggle checked={p.consent.messagingChannel} onChange={(v) => save({ consent: { ...p.consent, messagingChannel: v } })} label="Contact me via messaging apps" description="Only for urgent or truly meaningful moments." />
              </div>
            </Card>

            <Card className="p-6">
              <SectionTitle title="What the Co-Pilot remembers" />
              {ctx.memory.length ? (
                <ul className="divide-y divide-line">
                  {ctx.memory.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <div className="text-[14px] text-ink">{m.fact}</div>
                        <div className="text-[12px] text-muted">You said: &ldquo;{m.statement}&rdquo; · {m.date}</div>
                      </div>
                      <Button size="sm" variant="quiet" onClick={() => call("/api/memory", { method: "DELETE", json: { factId: m.id } }, "Forgotten.")} aria-label="Forget">
                        <Trash2 size={14} /> Forget
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted">Nothing yet. Try telling the Co-Pilot &ldquo;I want to buy a house in 2029&rdquo;.</p>
              )}
            </Card>

            <Card className="p-6">
              <SectionTitle title="Recommendations you turned off" />
              {p.neverRecommend.length ? (
                <ul className="divide-y divide-line">
                  {p.neverRecommend.map((key) => (
                    <li key={key} className="flex items-center justify-between gap-4 py-3">
                      <span className="text-[14px] text-ink">{titleFor(key)}</span>
                      <Button size="sm" variant="secondary" onClick={() => call(`/api/recommendations/${encodeURIComponent(key)}/feedback`, { method: "DELETE" }, "Allowed again.")}>
                        Allow again
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted">None. Use &ldquo;Don&apos;t recommend this again&rdquo; on any insight to add it here.</p>
              )}
            </Card>

            <Card className="p-6">
              <SectionTitle title="How your data is used" />
              <ul className="space-y-2">
                {DATA_USE.map((d) => (
                  <li key={d} className="flex gap-2.5 text-[13px] text-slate-600"><Database size={14} className="mt-0.5 shrink-0 text-muted" /> {d}</li>
                ))}
              </ul>
              <p className="mt-4 text-[12px] text-muted">
                Current AI mode: {ai.mode === "llm" ? `LLM phrasing (${ai.provider})` : "deterministic"}. Numbers are always computed by KBC&apos;s engine. A language model, if enabled, only rephrases them and never sees your full transaction history.
              </p>
            </Card>
          </div>
        );
      }}
    </WithSnapshot>
  );
}
