import { describe, expect, it } from "vitest";
import { classifyIntent, parseAmount } from "./intents";

describe("intent classification", () => {
  it("parses euro amounts including thousands separators and k-suffix", () => {
    expect(parseAmount("€2,000")).toBe(2000);
    expect(parseAmount("1.5k")).toBe(1500);
    expect(parseAmount("€29")).toBe(29);
  });

  it("routes the demo questions to the right intents", () => {
    expect(classifyIntent("Show me").intent).toBe("hero");
    expect(classifyIntent("Can I afford a €2,000 holiday next month?")).toEqual({
      intent: "affordability",
      amount: 2000,
      purpose: "holiday",
      years: undefined,
    });
    expect(classifyIntent("Show me my options for the insurance payment").intent).toBe("cashflow_options");
    expect(classifyIntent("Should I invest in ETFs?").intent).toBe("investing");
    expect(classifyIntent("How much should I save every month if I want to buy a house in 3 years?").intent).toBe("save_for_goal");
    expect(classifyIntent("Why am I spending more this month?").intent).toBe("spending_why");
  });
});
