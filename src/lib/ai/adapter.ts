/**
 * LLM adapter boundary. The LLM is only used for intent understanding and
 * phrasing; every number it sees comes from the deterministic engine.
 */
import { OpenAICompatibleAdapter } from "./openai";

export interface LLMAdapter {
  readonly name: string;
  complete(system: string, user: string): Promise<string>;
}

export function getAdapter(): LLMAdapter | null {
  const provider = process.env.LLM_PROVIDER?.toLowerCase();
  const key = process.env.OPENAI_API_KEY;
  if (provider === "openai" && key) {
    return new OpenAICompatibleAdapter({
      apiKey: key,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
  }
  return null;
}

export function aiStatus() {
  const adapter = getAdapter();
  return { mode: adapter ? "llm" : "deterministic", provider: adapter?.name ?? "fallback" } as const;
}
