"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Clapperboard, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCopilot } from "@/components/providers/CopilotProvider";

const HOLIDAY = "Can I afford a €2,000 holiday next month?";

/** Presenter panel: runs the four jury scenarios in order. Demo-only UI. */
export function DemoDirector() {
  const router = useRouter();
  const { trigger, notify, snapshot } = useCopilot();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const heroDone = snapshot?.context.feedback.some((f) => f.key.startsWith("goal_deviation") && f.outcome === "accepted") ?? false;
  const decisionDone = snapshot?.context.opportunities.some((o) => o.type === "contextual_decision") ?? false;
  const invoiceSent = snapshot?.context.notifications.some((n) => n.opportunityKey.startsWith("cashflow_risk")) ?? false;
  const ordersRun = snapshot?.context.events.some((e) => e.type === "standing_orders") ?? false;

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusy(id);
    try {
      await fn();
    } catch (e) {
      notify((e as Error).message, "risk");
    } finally {
      setBusy(null);
    }
  };

  const steps = [
    {
      id: "hero",
      title: "1 · Goal back on track",
      body: "Dashboard briefing, then \"Show me\" and approve the two changes.",
      done: heroDone,
      action: () => run("hero", async () => router.push("/")),
      cta: "Open overview",
    },
    {
      id: "decision",
      title: "2 · Decision support",
      body: `Ask: "${HOLIDAY}"`,
      done: decisionDone,
      action: () => run("decision", async () => router.push(`/copilot?q=${encodeURIComponent(HOLIDAY)}`)),
      cta: "Ask Co-Pilot",
    },
    {
      id: "proactive",
      title: "3 · Proactive, cross-channel",
      body: `The insurer's payment request arrives while ${snapshot?.context.profile.firstName ?? "the customer"} is not in the app.`,
      done: invoiceSent,
      action: () =>
        run("proactive", async () => {
          if (!invoiceSent) notify(await trigger("insurance_invoice"));
          router.push("/channels");
        }),
      cta: invoiceSent ? "Open messaging" : "Send event",
    },
    {
      id: "positive",
      title: "4 · Positive progress",
      body: "Next morning: standing orders run and the emergency fund crosses 75%.",
      done: ordersRun,
      action: () =>
        run("positive", async () => {
          if (!ordersRun) notify(await trigger("standing_orders"), "positive");
          router.push("/");
        }),
      cta: ordersRun ? "Open overview" : "Run day",
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-white shadow-lift hover:bg-ink-soft lg:bottom-6 lg:right-6"
        aria-expanded={open}
        aria-label="Demo director"
      >
        <Clapperboard size={15} /> <span className="hidden sm:inline">Demo director</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="fixed bottom-36 right-4 z-40 w-[min(92vw,340px)] rounded-2xl border border-line bg-white p-4 shadow-lift lg:bottom-20 lg:right-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-ink">Demo director</div>
                <div className="text-[12px] text-muted">Presenter controls · not customer UI</div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 text-muted hover:bg-surface" aria-label="Close demo director">
                <X size={16} />
              </button>
            </div>
            <ol className="space-y-2">
              {steps.map((s) => (
                <li key={s.id} className={clsx("rounded-xl border p-3", s.done ? "border-growth/30 bg-growth-50/40" : "border-line")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[13px] font-semibold text-ink">{s.title}</div>
                      <div className="mt-0.5 text-[12px] leading-snug text-muted">{s.body}</div>
                    </div>
                    <button
                      onClick={s.action}
                      disabled={busy !== null}
                      className="shrink-0 rounded-full bg-brand px-3 py-1 text-[12px] font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {busy === s.id ? "..." : s.cta}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => router.push("/intelligence")} className="text-[12px] font-medium text-brand hover:underline">
                Open intelligence view
              </button>
              <button
                onClick={() => run("reset", async () => {
                  notify(await trigger("reset"));
                  router.push("/");
                })}
                className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink"
              >
                <RotateCcw size={12} /> Reset demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
