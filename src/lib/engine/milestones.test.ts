import { describe, expect, it } from "vitest";
import { createSeedState } from "@/lib/services/seed";
import { resetState, getState } from "@/lib/services/store";
import { triggerEvent } from "@/lib/services/events";
import { newMilestones, reachedMilestones } from "./milestones";

describe("milestones", () => {
  it("does not re-fire milestones already reached at seed time", () => {
    const state = createSeedState();
    expect(newMilestones(state)).toHaveLength(0);
    expect(reachedMilestones(state).length).toBeGreaterThan(0);
    expect(state.acknowledgedMilestones).toEqual(reachedMilestones(state).map((m) => m.key));
  });

  it("surfaces the emergency 75% milestone after standing orders, once", () => {
    resetState();
    triggerEvent("standing_orders");
    const state = getState();
    const fresh = newMilestones(state);
    expect(fresh.some((m) => m.goalId === "goal-emergency" && m.amount === 6750)).toBe(true);
    expect(fresh.filter((m) => m.key === "goal-emergency:6750")).toHaveLength(1);
  });
});
