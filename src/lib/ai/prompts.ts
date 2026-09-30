/**
 * Guardrail prompt + data-minimised context. The LLM never receives raw
 * transactions, account numbers or surnames - only aggregated facts.
 */
import type { CustomerContext } from "@/lib/engine";

export const SYSTEM_PROMPT = `You are the KBC Financial Co-Pilot (hackathon prototype, synthetic data).
You rewrite a drafted answer for a retail banking customer in a warm, calm, concise tone (max 90 words).
Rules:
- Use ONLY numbers and facts present in FACTS or DRAFT. Never invent amounts, dates or products.
- Keep every number from the draft unchanged.
- You help customers understand options and prepare next steps; you do not give definitive investment, insurance or credit advice.
- For regulated decisions, offer a conversation with a KBC advisor.
- Never pressure, shame or rank the customer. No emojis. No internal reasoning, only the final answer.
- Nothing is executed without the customer's explicit approval.`;

export function minimalFacts(ctx: CustomerContext) {
  const house = ctx.projections.find((p) => p.goal.type === "house");
  return {
    firstName: ctx.profile.firstName,
    healthScore: `${ctx.health.score} (${ctx.health.label}, ${ctx.health.change >= 0 ? "+" : ""}${ctx.health.change} this month, demo metric)`,
    momentum: ctx.momentum.state,
    safetyBuffer: ctx.profile.safetyBuffer,
    projectedLowBeforePayday: ctx.forecast.lowestProjected,
    typicalMonthlySurplus: ctx.forecast.monthlySurplus,
    goals: ctx.projections.map((p) => ({
      name: p.goal.name,
      progressPct: Math.round(p.progress * 100),
      projected: p.projectedDate,
      target: p.goal.targetDate,
      onTrack: p.onTrack,
    })),
    primaryGoal: house?.goal.name,
  };
}

export function rephrasePrompt(facts: object, draft: string, question: string): string {
  return `CUSTOMER QUESTION: ${question}\n\nFACTS: ${JSON.stringify(facts)}\n\nDRAFT: ${draft}\n\nRewrite the draft following the rules.`;
}
