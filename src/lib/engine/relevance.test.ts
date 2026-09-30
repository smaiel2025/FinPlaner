import { beforeEach, describe, expect, it } from "vitest";
import { createSeedState } from "@/lib/services/seed";
import { resetState, getState } from "@/lib/services/store";
import { triggerEvent } from "@/lib/services/events";
import { analyzeCustomer, scoreAll } from "./index";
import { THRESHOLDS } from "./relevance";

describe("relevance gating", () => {
  beforeEach(() => resetState());

  it("surfaces only findings at or above the balanced threshold of 65", () => {
    const ctx = analyzeCustomer(createSeedState());
    const feed = ctx.opportunities.filter((o) => o.relevance.surfaced && o.type !== "contextual_decision");
    expect(feed.map((o) => o.type).sort()).toEqual(["goal_deviation", "spending_anomaly"].sort());
    expect(feed.every((o) => o.relevance.score >= THRESHOLDS.balanced)).toBe(true);
    expect(feed.find((o) => o.type === "goal_deviation")?.relevance.score).toBe(80);
  });

  it("bundles unused CineMax+ into the house-goal recommendation", () => {
    const unused = analyzeCustomer(createSeedState()).opportunities.find((o) => o.key.includes("cinemax"));
    expect(unused?.relevance.surfaced).toBe(false);
    expect(unused?.relevance.suppressionReason).toMatch(/broader recommendation/i);
  });

  it("holds predicted insurance below the threshold until the invoice is confirmed", () => {
    const predicted = analyzeCustomer(createSeedState()).opportunities.find((o) => o.type === "cashflow_risk");
    expect(predicted?.relevance.surfaced).toBe(false);
    expect(predicted?.relevance.score).toBeLessThan(THRESHOLDS.balanced);

    triggerEvent("insurance_invoice");
    const confirmed = analyzeCustomer(getState()).opportunities.find((o) => o.type === "cashflow_risk")!;
    expect(confirmed.relevance.surfaced).toBe(true);
    expect(confirmed.relevance.score).toBeGreaterThanOrEqual(80);
    expect(confirmed.channel).toBe("whatsapp");
  });

  it("applies a frequency penalty only to outbound messaging, not the in-app feed", () => {
    triggerEvent("insurance_invoice");
    triggerEvent("standing_orders");
    const traces = scoreAll(getState());
    const milestone = traces.find((o) => o.key === "milestone:goal-emergency:6750")!;
    expect(milestone.relevance.surfaced).toBe(true);
    expect(milestone.relevance.score).toBeGreaterThanOrEqual(THRESHOLDS.balanced);
    expect(milestone.relevance.frequencyPenalty).toBeGreaterThan(0);
    expect(milestone.relevance.messagingScore).toBeLessThan(milestone.relevance.score);
    expect(milestone.relevance.messagingScore).toBeLessThan(THRESHOLDS.balanced);
    expect(milestone.channel).toBe("app");
  });
});
