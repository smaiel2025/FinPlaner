/**
 * The assistant's opening message on the dashboard. Chooses the single most
 * relevant thing to say, based on what the relevance engine surfaced.
 */
import type { CustomerContext } from "@/lib/engine";
import { eur, monthYear, pct } from "@/lib/utils/format";

export interface Briefing {
  message: string;
  tone: "risk" | "opportunity" | "positive" | "info";
  cta?: { label: string; prompt: string };
}

export function buildBriefing(ctx: CustomerContext): Briefing {
  const travel = ctx.projections.find((p) => p.goal.type === "travel");
  const house = ctx.projections.find((p) => p.goal.type === "house");
  const travelLine = travel ? (travel.onTrack ? `You're still on track for your ${travel.goal.name.replace(" trip", "")} trip` : `Your ${travel.goal.name.toLowerCase()} needs a small top-up`) : "";

  const risk = ctx.feed.find((o) => o.type === "cashflow_risk");
  if (risk) {
    return {
      tone: "risk",
      message: `${risk.title}. Your balance before payday is projected at about ${eur(ctx.forecast.lowestProjected)}, below the safety balance you chose. I found a way to keep your buffer without changing your goals.`,
      cta: { label: "Show options", prompt: "Show me my options for the insurance payment" },
    };
  }

  const milestone = ctx.feed.find((o) => o.type === "milestone");
  if (milestone) {
    return { tone: "positive", message: `${milestone.title}. ${milestone.summary}`, cta: { label: "See my progress", prompt: "How am I doing on my goals?" } };
  }

  const deviation = ctx.feed.find((o) => o.type === "goal_deviation");
  if (deviation && house) {
    const behind = Math.round(-house.monthsAheadOfTarget);
    return {
      tone: "opportunity",
      message: `${travelLine}, but your house deposit goal has slipped by approximately ${behind === 1 ? "one month" : `${behind} months`}. I found ${deviation.actions.length === 2 ? "two changes" : "a change"} that could put you back on track without affecting your emergency fund.`,
      cta: { label: "Show me", prompt: "Show me" },
    };
  }

  if (house) {
    return {
      tone: "positive",
      message: `${travelLine}, and your house deposit is ${pct(house.progress)} complete - projected for ${monthYear(house.projectedDate)}, ${house.monthsAheadOfTarget >= 1 ? `about ${Math.round(house.monthsAheadOfTarget)} months ahead of plan` : "on track"}.`,
      cta: { label: "See my progress", prompt: "How am I doing on my goals?" },
    };
  }
  return { tone: "info", message: "Everything looks calm today. Ask me anything about your finances." };
}
