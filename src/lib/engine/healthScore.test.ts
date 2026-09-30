import { describe, expect, it } from "vitest";
import { createSeedState } from "@/lib/services/seed";
import { computeHealthScore, label } from "./healthScore";

describe("health score", () => {
  it("scores Sophie as Stable 76 with a +4 month change", () => {
    const health = computeHealthScore(createSeedState());
    expect(health.score).toBe(76);
    expect(health.previous).toBe(72);
    expect(health.change).toBe(4);
    expect(health.label).toBe("Stable");
    expect(health.factors).toHaveLength(5);
    expect(health.factors.reduce((s, f) => s + f.weight, 0)).toBeCloseTo(1, 5);
    expect(health.reasons.length).toBeGreaterThan(0);
  });

  it("maps bands to labels", () => {
    expect(label(80)).toBe("Strong");
    expect(label(65)).toBe("Stable");
    expect(label(50)).toBe("Building");
    expect(label(49)).toBe("Needs attention");
  });
});
