import { describe, expect, it } from "vitest";
import { createSeedState } from "@/lib/services/seed";
import { goalImpact, projectAll, projectGoal } from "./goals";

describe("goal projections", () => {
  const state = createSeedState();
  const house = state.goals.find((g) => g.type === "house")!;
  const japan = state.goals.find((g) => g.type === "travel")!;
  const emergency = state.goals.find((g) => g.type === "emergency")!;

  it("puts the house deposit about two months behind", () => {
    const p = projectGoal(house, state.today);
    expect(Math.round(p.progress * 100)).toBe(31);
    expect(p.requiredMonthly).toBeGreaterThan(house.monthlyContribution);
    expect(p.projectedDate?.startsWith("2030-05")).toBe(true);
    expect(p.onTrack).toBe(false);
    expect(p.monthsAheadOfTarget).toBeLessThan(-1);
    expect(p.monthsAheadOfTarget).toBeGreaterThan(-3);
  });

  it("keeps Japan on track and the emergency fund slightly ahead", () => {
    const j = projectGoal(japan, state.today);
    const e = projectGoal(emergency, state.today);
    expect(Math.round(j.progress * 100)).toBe(45);
    expect(j.onTrack).toBe(true);
    expect(Math.round(e.progress * 100)).toBe(72);
    expect(e.onTrack).toBe(true);
  });

  it("moves the house date earlier when monthly contribution rises", () => {
    const both = goalImpact(house, state.today, { monthlyDelta: 149 });
    expect(both.projectedBefore?.startsWith("2030-05")).toBe(true);
    expect(both.projectedAfter?.startsWith("2029-09")).toBe(true);
    expect(both.weeksShift).toBeGreaterThan(20);
  });

  it("projects every goal", () => {
    expect(projectAll(state)).toHaveLength(3);
  });
});
