"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { Check, CircleCheck, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProgressBar } from "@/components/goals/ProgressBar";
import { ProjectionTimeline } from "@/components/goals/ProjectionTimeline";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/primitives";
import { api } from "@/lib/api/client";
import type { ApprovalResult } from "@/lib/services/actions";
import type { GoalImpact } from "@/lib/types/intelligence";
import { eur, monthYear, weeksPhrase } from "@/lib/utils/format";

const GOAL_KINDS = new Set(["cancel_subscription", "adjust_contribution", "transfer"]);

/** Review -> explicit approval -> visible outcome. Nothing executes before "Approve". */
export function ActionSheet() {
  const { review: opp, openReview, approve, snapshot, notify } = useCopilot();
  const [selected, setSelected] = useState<string[]>([]);
  const [impact, setImpact] = useState<GoalImpact | null>(null);
  const [result, setResult] = useState<ApprovalResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opp) return;
    setSelected(opp.actions.filter((a) => a.recommended).map((a) => a.id));
    setResult(null);
    setError(null);
  }, [opp]);

  const goalActions = useMemo(() => (opp?.actions ?? []).filter((a) => selected.includes(a.id) && GOAL_KINDS.has(a.kind) && a.goalId), [opp, selected]);

  useEffect(() => {
    if (!goalActions.length) return setImpact(null);
    const monthly = goalActions.filter((a) => a.kind !== "transfer").reduce((s, a) => s + (a.amount ?? 0), 0);
    const oneOff = goalActions.filter((a) => a.kind === "transfer").reduce((s, a) => s + (a.amount ?? 0), 0);
    api<{ impact: GoalImpact }>("/api/simulate", { method: "POST", json: { type: "whatif", goalId: goalActions[0].goalId, monthlyDelta: monthly, oneOff } })
      .then((r) => setImpact(r.impact))
      .catch(() => setImpact(null));
  }, [goalActions]);

  const close = () => openReview(null);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const reschedule = opp?.actions.find((a) => a.kind === "reschedule_transfer" && selected.includes(a.id));
  const low = snapshot?.context.forecast.lowestProjected ?? 0;

  const onApprove = async () => {
    if (!opp) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await approve(opp.key, selected));
      notify("Done - your changes are in place.", "positive");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const goalId = opp?.relatedGoalId;
  const before = result?.before.find((p) => p.goal.id === goalId);
  const after = result?.after.find((p) => p.goal.id === goalId);

  return (
    <Drawer
      open={!!opp}
      onClose={close}
      title={result ? "Changes approved" : "Review changes"}
      footer={
        result ? (
          <Button className="w-full" onClick={close}>Done</Button>
        ) : (
          <div>
            {error && <p className="mb-2 text-[13px] text-risk">{error}</p>}
            <Button className="w-full" disabled={!selected.length || busy} onClick={onApprove}>
              <Lock size={14} /> {busy ? "Applying..." : `Approve ${selected.length} change${selected.length === 1 ? "" : "s"}`}
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted">Nothing happens without your approval. Execution is simulated in this prototype.</p>
          </div>
        )
      }
    >
      {opp && !result && (
        <div className="space-y-5">
          <p className="text-[14px] leading-relaxed text-slate-600">{opp.summary}</p>
          <div className="space-y-2.5">
            {opp.actions.filter((a) => a.kind !== "info").map((a) => {
              const on = selected.includes(a.id);
              return (
                <button key={a.id} onClick={() => toggle(a.id)} className={clsx("w-full rounded-2xl border p-4 text-left transition-colors", on ? "border-brand bg-brand-50/50" : "border-line hover:bg-surface")}>
                  <div className="flex items-start gap-3">
                    <span className={clsx("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border", on ? "border-brand bg-brand text-white" : "border-slate-300 bg-white")}>
                      {on && <Check size={13} strokeWidth={3} />}
                    </span>
                    <div>
                      <div className="text-[14px] font-medium text-ink">{a.label}</div>
                      <div className="mt-0.5 text-[13px] text-slate-600">{a.description}</div>
                      {a.tradeOff && <div className="mt-2 text-[12px] text-muted">Trade-off: {a.tradeOff}</div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {impact && (
            <div className="rounded-2xl bg-surface p-4">
              <div className="text-[12px] font-medium uppercase tracking-wide text-muted">Impact on {impact.goalName.toLowerCase()}</div>
              <div className="mt-1 text-[14px] text-ink">
                Projected date <span className="font-semibold">{monthYear(impact.projectedBefore)}</span> → <span className="font-semibold text-growth">{monthYear(impact.projectedAfter)}</span>
                <span className="text-muted"> ({weeksPhrase(impact.weeksShift)} earlier)</span>
              </div>
              {snapshot && (
                <ProjectionTimeline today={snapshot.context.today} target={snapshot.context.projections.find((p) => p.goal.id === impact.goalId)!.goal.targetDate} projected={impact.projectedAfter} previous={impact.projectedBefore} compact />
              )}
            </div>
          )}

          {reschedule && (
            <div className="rounded-2xl bg-surface p-4 text-[14px] text-ink">
              Lowest balance before payday <span className="font-semibold">{eur(low)}</span> → <span className="font-semibold text-growth">{eur(low + (reschedule.amount ?? 0))}</span>
              <div className="mt-1 text-[12px] text-muted">Your emergency fund is not touched in any option.</div>
            </div>
          )}
        </div>
      )}

      {opp && result && (
        <div className="space-y-5">
          <ul className="space-y-2">
            {result.changes.map((c) => (
              <motion.li key={c} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 text-[14px] text-ink">
                <CircleCheck size={18} className="shrink-0 text-growth" /> {c}
              </motion.li>
            ))}
          </ul>
          {before && after && snapshot && (
            <div className="rounded-2xl border border-line p-4">
              <div className="text-[13px] font-semibold text-ink">{after.goal.name}</div>
              <div className="mt-2 flex items-baseline justify-between text-[13px]">
                <span className="text-muted">Progress</span>
                <span className="tabular font-medium text-ink">{Math.round(before.progress * 100)}% → {Math.round(after.progress * 100)}%</span>
              </div>
              {after.goal.monthlyContribution !== before.goal.monthlyContribution && (
                <div className="mt-1 flex items-baseline justify-between text-[13px]">
                  <span className="text-muted">Monthly contribution</span>
                  <span className="tabular font-medium text-ink">{eur(before.goal.monthlyContribution)} → <span className="text-growth">{eur(after.goal.monthlyContribution)}</span></span>
                </div>
              )}
              <div className="mt-1.5"><ProgressBar value={after.progress} previous={before.progress} /></div>
              <ProjectionTimeline today={snapshot.context.today} target={after.goal.targetDate} projected={after.projectedDate} previous={before.projectedDate} />
              <p className="mt-3 text-[13px] text-slate-600">
                {after.projectedDate && before.projectedDate && after.projectedDate < before.projectedDate
                  ? `Your projected date moved from ${monthYear(before.projectedDate)} to ${monthYear(after.projectedDate)}.`
                  : "Your goal timeline is unchanged."}
              </p>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
