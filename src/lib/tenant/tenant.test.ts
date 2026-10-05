import { describe, expect, it } from "vitest";
import { analyzeCustomer, scoreAll } from "@/lib/engine";
import { detectOpportunities } from "@/lib/engine/opportunities";
import { projectAll } from "@/lib/engine/goals";
import { defaultPreferences } from "@/lib/data/customer";
import { createSeedState } from "@/lib/services/seed";
import { kbc } from "./kbc";

describe("tenant plug-in", () => {
  it("keeps the KBC hero recommendation and health score", () => {
    const state = createSeedState();
    const ctx = analyzeCustomer(state);
    expect(ctx.health.score).toBe(76);
    expect(ctx.opportunities.some((o) => o.type === "goal_deviation" && o.relevance.surfaced)).toBe(true);
    expect(kbc.enabledDetectors).toContain("positive_behavior");
  });

  it("drops a detector the bank has switched off", () => {
    const state = createSeedState();
    const enabled = kbc.enabledDetectors.filter((id) => id !== "positive_behavior");
    const found = detectOpportunities(state, projectAll(state), enabled);
    expect(found.some((o) => o.type === "positive_behavior")).toBe(false);
    expect(found.some((o) => o.type === "goal_deviation")).toBe(true);
  });

  it("defaults the host switch on and skips scoring when it is off", () => {
    const state = createSeedState();
    expect(defaultPreferences.copilotEnabled).toBe(true);
    expect(state.preferences.copilotEnabled).toBe(true);
    state.preferences = { ...state.preferences, copilotEnabled: false };
    expect(state.preferences.copilotEnabled).toBe(false);
    expect(scoreAll(state)).toEqual([]);
  });
});