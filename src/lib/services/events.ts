/**
 * Demo event bus. In production these would be streaming events (transaction
 * posted, invoice received, salary credited). Each event re-evaluates only this
 * customer and dispatches notifications that pass the relevance gate.
 */
import { scoreAll } from "@/lib/engine";
import { recurringPrice } from "@/lib/engine/signals";
import type { ScoredOpportunity } from "@/lib/types/intelligence";
import { addDays } from "@/lib/utils/dates";
import { goalService, transactionService } from "./mock";
import { getState, mutate, nextId, resetState } from "./store";

const CUSTOMER = "cust-sophie-001";

export type DemoEvent = "insurance_invoice" | "standing_orders" | "reset";

function messagingText(o: ScoredOpportunity): string {
  if (o.type === "milestone") {
    return `Small milestone worth noticing: ${o.title.replace("Milestone reached: ", "your ").toLowerCase()}. ${o.summary}`;
  }
  const n = o.actions.filter((a) => a.kind !== "keep").length;
  return `${o.title}. ${o.summary} I found ${n} ways to keep your normal financial buffer.`;
}

/** Sends messaging notifications for newly surfaced items routed outside the app. */
function dispatch(): ScoredOpportunity[] {
  const state = getState();
  const sent = new Set(state.notifications.map((n) => n.opportunityKey));
  const fresh = scoreAll(state).filter((o) => o.relevance.surfaced && o.channel === "whatsapp" && !sent.has(o.key));
  mutate((s) => {
    for (const o of fresh) {
      const body = messagingText(o);
      s.notifications.push({
        id: nextId("ntf"),
        date: s.today,
        channel: "whatsapp",
        kind: o.tone === "risk" ? "risk" : o.type === "milestone" ? "milestone" : "opportunity",
        opportunityKey: o.key,
        title: o.title,
        body,
      });
      s.conversation.push({ id: nextId("msg"), role: "assistant", text: body, channel: "whatsapp", source: "deterministic", createdAt: new Date().toISOString() });
    }
  });
  return fresh;
}

function log(type: string, label: string) {
  mutate((s) => void s.events.push({ id: nextId("evt"), date: s.today, type, label }));
}

export function triggerEvent(event: DemoEvent): { label: string; notified: ScoredOpportunity[] } {
  if (event === "reset") {
    resetState();
    return { label: "Demo reset", notified: [] };
  }

  if (event === "insurance_invoice") {
    mutate((s) => {
      const up = s.upcoming.find((u) => u.id === "up-insurance");
      if (up) up.certainty = "confirmed";
    });
    log("invoice_received", "Insurer payment request received: €780 due Friday");
    return { label: "Insurance payment request received", notified: dispatch() };
  }

  // standing_orders: move the demo clock one day forward and execute what is due.
  const from = getState().today;
  const to = addDays(from, 1);
  mutate((s) => void (s.today = to));
  const state = getState();
  for (const r of state.recurring) {
    const date = `${to.slice(0, 8)}${String(r.dayOfMonth).padStart(2, "0")}`;
    if (r.status === "active" && date > from && date <= to) {
      transactionService.record(CUSTOMER, { date, amount: -recurringPrice(r, date), category: r.category, merchant: r.merchant, recurringId: r.id });
    }
  }
  for (const g of state.goals) {
    if (g.nextTransferDate > from && g.nextTransferDate <= to) {
      goalService.contribute(CUSTOMER, g.id, g.monthlyContribution, to);
      goalService.update(CUSTOMER, g.id, { nextTransferDate: addDays(g.nextTransferDate, 31).slice(0, 8) + "01" });
    }
  }
  log("standing_orders", `${to}: rent and scheduled goal transfers executed`);
  return { label: "Scheduled payments executed", notified: dispatch() };
}
