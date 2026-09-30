"use client";

import { Eye, ShieldCheck } from "lucide-react";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/primitives";

/** Customer-facing explanation based only on observable data (no internal reasoning). */
export function WhyDrawer() {
  const { why: opp, openWhy, feedback } = useCopilot();
  const close = () => openWhy(null);

  return (
    <Drawer
      open={!!opp}
      onClose={close}
      title="Why am I seeing this?"
      footer={
        opp && (
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="quiet"
              size="sm"
              onClick={() => {
                close();
                void feedback(opp.key, "never");
              }}
            >
              Don&apos;t recommend this again
            </Button>
            <Button size="sm" onClick={close}>Got it</Button>
          </div>
        )
      }
    >
      {opp && (
        <div className="space-y-6">
          <div>
            <h4 className="text-[15px] font-semibold text-ink">{opp.title}</h4>
          </div>

          <section>
            <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-ink">
              <Eye size={15} className="text-brand" /> We noticed
            </div>
            <ul className="space-y-2">
              {opp.signals.map((s) => (
                <li key={s.id} className="flex gap-2.5 text-[14px] leading-relaxed text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {s.customerText}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-surface p-4">
            <div className="text-[12px] font-medium uppercase tracking-wide text-muted">Why now</div>
            <p className="mt-1 text-[14px] text-ink">{opp.whyNow}.</p>
            <div className="mt-3 text-[12px] font-medium uppercase tracking-wide text-muted">Relevance for you</div>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-brand" style={{ width: `${opp.relevance.score}%` }} />
              </div>
              <span className="tabular text-[13px] font-semibold text-ink">{opp.relevance.score}/100</span>
            </div>
            <p className="mt-1.5 text-[12px] text-muted">
              We only show suggestions scoring {opp.relevance.threshold}+ based on financial impact, urgency, relevance to your goals and confidence. You can change this in AI controls.
            </p>
          </section>

          <section className="flex gap-3 rounded-2xl border border-line p-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-growth" />
            <p className="text-[13px] leading-relaxed text-slate-600">
              This is a suggestion based on your own account data, not personal financial advice. Nothing happens without your approval, and you can turn off this type of insight at any time.
            </p>
          </section>
        </div>
      )}
    </Drawer>
  );
}
