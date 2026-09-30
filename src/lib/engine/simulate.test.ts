import { describe, expect, it } from "vitest";
import { createSeedState } from "@/lib/services/seed";
import { affordability } from "./simulate";

describe("affordability", () => {
  const state = createSeedState();

  it("treats €2,000 as a trade-off of about six weeks on the house goal", () => {
    const r = affordability(state, 2000, "holiday");
    expect(r.verdict).toBe("tradeoff");
    const main = r.options[0];
    expect(main.amount).toBe(2000);
    expect(main.noImpact).toBe(false);
    expect(main.delayWeeks).toBeGreaterThanOrEqual(5);
    expect(main.delayWeeks).toBeLessThanOrEqual(7);
  });

  it("delays the house goal about two weeks at €1,500 and not at all around €1,100", () => {
    const mid = affordability(state, 1500, "holiday").options[0];
    expect(mid.delayWeeks).toBeGreaterThanOrEqual(1);
    expect(mid.delayWeeks).toBeLessThanOrEqual(3);
    const low = affordability(state, 1100, "holiday").options.find((o) => o.amount === 1100)!;
    expect(low.noImpact).toBe(true);
    expect(low.delayWeeks).toBe(0);
  });
});
