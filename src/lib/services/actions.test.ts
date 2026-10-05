import { beforeEach, describe, expect, it } from "vitest";
import { analyzeCustomer } from "@/lib/engine";
import { currentCustomerId, getState, mutate, resetState } from "./store";
import { approveActions } from "./actions";

describe("approval flow", () => {
  beforeEach(() => resetState());

  it("redirects CineMax+ and surplus into the house deposit after explicit approval", () => {
    const before = analyzeCustomer(getState());
    const hero = before.opportunities.find((o) => o.type === "goal_deviation")!;
    const houseBefore = before.projections.find((p) => p.goal.type === "house")!;

    const result = approveActions(hero.key, hero.actions.map((a) => a.id));
    const after = analyzeCustomer(getState());
    const house = after.projections.find((p) => p.goal.type === "house")!;
    const cine = after.recurring.find((r) => r.id === "rec-cinemax")!;

    expect(cine.status).toBe("cancel_requested");
    expect(house.goal.monthlyContribution).toBe(779);
    expect(house.projectedDate?.startsWith("2029-09")).toBe(true);
    expect(houseBefore.projectedDate?.startsWith("2030-05")).toBe(true);
    expect(result.changes.length).toBe(2);
    expect(getState().feedback.some((f) => f.key === hero.key && f.outcome === "accepted")).toBe(true);
    expect(after.opportunities.find((o) => o.key === hero.key)?.relevance.surfaced ?? false).toBe(false);
  });

  it("approves using the profile id, not a fixed customer", () => {
    mutate((s) => {
      s.profile.id = "cust-host-42";
    });
    expect(currentCustomerId()).toBe("cust-host-42");
    const hero = analyzeCustomer(getState()).opportunities.find((o) => o.type === "goal_deviation")!;
    approveActions(hero.key, hero.actions.map((a) => a.id));
    const house = getState().goals.find((g) => g.type === "house")!;
    expect(getState().profile.id).toBe("cust-host-42");
    expect(house.monthlyContribution).toBe(779);
  });

  it("refuses to execute when no actions are selected", () => {
    const hero = analyzeCustomer(getState()).opportunities.find((o) => o.type === "goal_deviation")!;
    expect(() => approveActions(hero.key, [])).toThrow(/at least one/i);
  });
});
