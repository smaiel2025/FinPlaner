/**
 * Deterministic response builder. Every answer is grounded in engine output
 * and returns structured blocks the UI renders as rich cards.
 */
import type { CustomerContext } from "@/lib/engine";
import { goalImpact } from "@/lib/engine/goals";
import { affordability } from "@/lib/engine/simulate";
import type { ChatBlock } from "@/lib/types/chat";
import type { CustomerState } from "@/lib/types/domain";
import { addMonths, monthsBetween } from "@/lib/utils/dates";
import { eur, longDate, monthYear, pct, weeksPhrase } from "@/lib/utils/format";
import type { ParsedIntent } from "./intents";
import { houseTimelineFact, type FactProposal } from "./memory";

export interface DraftAnswer {
  text: string;
  blocks: ChatBlock[];
  decision?: { amount: number; purpose: string };
  fact?: FactProposal;
}

const SUGGESTIONS = [
  "Can I afford a €2,000 holiday next month?",
  "Why am I spending more this month?",
  "How much should I save every month to buy a house in 3 years?",
  "How am I doing on my goals?",
];

const advisorLine = "I can help you understand the options and prepare the next step. For a personal recommendation, a KBC advisor can go through it with you.";

export function draftAnswer(p: ParsedIntent, ctx: CustomerContext, state: CustomerState, message: string, factId: string): DraftAnswer {
  const house = ctx.projections.find((x) => x.goal.type === "house");
  const firstName = ctx.profile.firstName;

  switch (p.intent) {
    case "hero": {
      const opp = ctx.opportunities.find((o) => o.type === "goal_deviation");
      if (!opp || !house) {
        return { text: `Good news: your house deposit is on track, projected for ${monthYear(house?.projectedDate ?? null)}.`, blocks: [{ type: "goalProgress", projections: ctx.projections }] };
      }
      const combined = opp.actions.reduce((s, a) => s + (a.amount ?? 0), 0);
      const impact = goalImpact(house.goal, state.today, { monthlyDelta: combined });
      const lines = opp.actions.map((a, i) => `${i + 1}. ${a.label}. ${a.description}`).join("\n");
      return {
        text: `Here is what I found. At ${eur(house.goal.monthlyContribution)}/month your house deposit lands in ${monthYear(house.projectedDate)} instead of ${monthYear(house.goal.targetDate)}.\n\n${lines}\n\nTogether, your projected date would move from ${monthYear(impact.projectedBefore)} to ${monthYear(impact.projectedAfter)}. Your emergency fund stays untouched, and nothing changes until you approve it.`,
        blocks: [{ type: "recommendation", opportunity: opp }],
      };
    }

    case "affordability": {
      if (!p.amount) {
        return {
          text: `Happy to check. What is the approximate price${p.purpose && p.purpose !== "purchase" ? ` of the ${p.purpose}` : ""}? I'll compare it against your balance, upcoming bills, safety balance and goals.`,
          blocks: [{ type: "suggestions", items: [`Can I afford a €15,000 ${p.purpose === "car" ? "car" : "purchase"}?`, "Can I afford a €2,000 holiday next month?"] }],
        };
      }
      const r = affordability(state, p.amount, p.purpose ?? "purchase");
      const main = r.options[0];
      const goal = r.primaryGoal.name.toLowerCase();
      let text: string;
      if (r.verdict === "comfortable") {
        text = `Yes. A ${eur(p.amount)} ${r.purpose} fits within your plan without affecting your goals. Your safety balance would be fully rebuilt by ${monthYear(r.bufferRestoredBy)}, and your emergency fund stays untouched.`;
      } else if (r.verdict === "tradeoff") {
        text = `Yes, but spending ${eur(p.amount)} would delay your ${goal} by about ${weeksPhrase(main.delayWeeks).replace("~", "")}. Here are ${r.options.length} options so you can choose the trade-off that feels right:`;
      } else {
        text = `It is possible, but ${eur(p.amount)} would delay your ${goal} by ${weeksPhrase(main.delayWeeks).replace("~", "about ")}. Your emergency fund stays untouched either way. ${advisorLine}`;
      }
      const blocks: ChatBlock[] = [{ type: "affordability", result: r }];
      if (r.verdict === "stretch") blocks.push({ type: "advisor", reason: "Large purchase that may involve financing" });
      return { text, blocks, decision: { amount: p.amount, purpose: r.purpose } };
    }

    case "spending_why": {
      const changed = ctx.financial.spending.filter((c) => c.average > 20 && Math.abs(c.changePct) >= 0.15).sort((a, b) => b.changePct - a.changePct);
      const up = changed.filter((c) => c.changePct > 0);
      const down = changed.filter((c) => c.changePct < 0);
      const upText = up.map((c) => `${c.category} ${eur(c.thisMonth)} vs ${eur(c.average)} usually (+${pct(c.changePct)})`).join("; ");
      const downText = down.length ? ` On the other hand, ${down.map((c) => `${c.category} is ${pct(-c.changePct)} lower`).join(" and ")}.` : "";
      return {
        text: up.length
          ? `This month you spent more mainly on: ${upText}. The energy increase is recurring, so it is worth a look; the restaurant spike looks like a one-month change.${downText}`
          : "Your spending this month is in line with your usual pattern.",
        blocks: [{ type: "spending", categories: changed }],
      };
    }

    case "save_for_goal":
    case "goal_statement": {
      const goal = state.goals.find((g) => g.type === "house")!;
      const years = p.years ?? Math.max(1, Math.round(monthsBetween(state.today, goal.targetDate) / 12));
      const targetDate = addMonths(state.today, years * 12);
      const months = monthsBetween(state.today, targetDate);
      const needed = Math.round((goal.targetAmount - goal.currentAmount) / months);
      const gap = needed - goal.monthlyContribution;
      const fact = p.years ? houseTimelineFact(state, message, p.years, factId) : null;
      const blocks: ChatBlock[] = [{ type: "savingsPlan", goalName: goal.name, targetAmount: goal.targetAmount, currentAmount: goal.currentAmount, targetDate, monthlyNeeded: needed, currentMonthly: goal.monthlyContribution }];
      if (fact) blocks.push({ type: "memory", fact: fact.fact, proposal: fact.proposal });
      return {
        text: `To reach ${eur(goal.targetAmount)} by ${monthYear(targetDate)} you would need about ${eur(needed)} a month. You currently put aside ${eur(goal.monthlyContribution)}, so that is ${gap > 0 ? `${eur(gap)} more per month` : "already covered"}.${fact ? " I've noted your timeline - shall I update your goal so future suggestions take it into account?" : ""}`,
        blocks,
        fact: fact ?? undefined,
      };
    }

    case "cashflow_options": {
      const opp = ctx.opportunities.find((o) => o.type === "cashflow_risk");
      if (!opp) {
        return { text: `Your upcoming payments are covered. Your lowest projected balance before payday is ${eur(ctx.forecast.lowestProjected)}, above your ${eur(ctx.profile.safetyBuffer)} safety balance.`, blocks: [] };
      }
      return {
        text: `Picking up where we left off: ${opp.title}. ${opp.summary} Here are your options - your goals receive the same amounts either way.`,
        blocks: [{ type: "recommendation", opportunity: opp }],
      };
    }

    case "progress": {
      const lines = ctx.projections.map((x) => `${x.goal.name}: ${pct(x.progress)} (${x.onTrack ? "on track" : "slightly behind"}, projected ${monthYear(x.projectedDate)})`).join("\n");
      return { text: `${ctx.momentum.message}\n\n${lines}`, blocks: [{ type: "goalProgress", projections: ctx.projections }] };
    }

    case "score":
      return {
        text: `Your Financial Health Score is ${ctx.health.score} - ${ctx.health.label} (${ctx.health.change >= 0 ? "+" : ""}${ctx.health.change} this month). It changed mainly because ${ctx.health.reasons.slice(0, 2).join(" and ")}. It is a personal progress indicator for this prototype - not a credit score.`,
        blocks: [{ type: "health", health: ctx.health }],
      };

    case "subscriptions": {
      const subs = ctx.recurring.filter((r) => r.category === "subscriptions" && r.status === "active");
      const total = subs.reduce((s, r) => s + r.amount, 0);
      const unused = subs.filter((r) => r.lastUsed && monthsBetween(r.lastUsed, state.today) >= 2);
      return {
        text: `You have ${subs.length} active subscriptions totalling ${eur(total, true)}/month: ${subs.map((s) => `${s.merchant} ${eur(s.amount, true)}`).join(", ")}.${unused.length ? ` ${unused.map((u) => u.merchant).join(", ")} has not been used since ${longDate(unused[0].lastUsed!)}.` : ""}`,
        blocks: [],
      };
    }

    case "investing": {
      const invest = ctx.accounts.find((a) => a.type === "investment");
      const emergency = ctx.projections.find((x) => x.goal.type === "emergency");
      return {
        text: `${advisorLine} For context: you hold ${eur(invest?.balance ?? 0)} in a balanced fund, and your emergency fund is ${pct(emergency?.progress ?? 0)} complete. Many people complete their emergency buffer before investing more, but the right choice depends on your situation and risk preference.`,
        blocks: [{ type: "advisor", reason: "Investment decisions are regulated advice" }],
      };
    }

    case "insurance_coverage":
      return {
        text: `You currently have: ${ctx.insurance.map((i) => `${i.name} (${i.coverage})`).join("; ")}. ${advisorLine}`,
        blocks: [{ type: "advisor", reason: "Insurance coverage review" }],
      };

    case "credit":
      return { text: `${advisorLine} I can show how a loan or mortgage payment would affect your goals once you have an indicative amount.`, blocks: [{ type: "advisor", reason: "Credit decisions require a personal assessment" }] };

    case "greeting":
      return { text: `Hi ${firstName}. I can help with decisions, spending questions and your goals. What's on your mind?`, blocks: [{ type: "suggestions", items: SUGGESTIONS }] };

    default:
      return {
        text: `I'm not sure I understood that yet. In this prototype I can help with affordability questions, spending changes, goal planning and your progress.`,
        blocks: [{ type: "suggestions", items: SUGGESTIONS }],
      };
  }
}
