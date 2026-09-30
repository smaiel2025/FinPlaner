import { describe, expect, it } from "vitest";
import { analyzeCustomer } from "@/lib/engine";
import { createSeedState } from "@/lib/services/seed";
import { classifyIntent } from "./intents";
import { draftAnswer } from "./fallback";

describe("deterministic fallback", () => {
  const state = createSeedState();
  const ctx = analyzeCustomer(state);

  it("answers the hero question with the house-goal recommendation", () => {
    const draft = draftAnswer(classifyIntent("Show me"), ctx, state, "Show me", "fact-1");
    expect(draft.text).toMatch(/May 2030/);
    expect(draft.text).toMatch(/CineMax/);
    expect(draft.text).toMatch(/€120/);
    expect(draft.blocks.some((b) => b.type === "recommendation")).toBe(true);
  });

  it("answers affordability with three trade-off options", () => {
    const parsed = classifyIntent("Can I afford a €2,000 holiday next month?");
    const draft = draftAnswer(parsed, ctx, state, "Can I afford a €2,000 holiday next month?", "fact-2");
    const card = draft.blocks.find((b) => b.type === "affordability");
    expect(card?.type).toBe("affordability");
    if (card?.type === "affordability") expect(card.result.options.length).toBeGreaterThanOrEqual(2);
    expect(draft.decision?.amount).toBe(2000);
  });

  it("hands investing questions to an advisor instead of recommending products", () => {
    const draft = draftAnswer(classifyIntent("Should I invest in ETFs?"), ctx, state, "Should I invest in ETFs?", "fact-3");
    expect(draft.blocks.some((b) => b.type === "advisor")).toBe(true);
    expect(draft.text.toLowerCase()).toMatch(/advisor/);
  });
});
