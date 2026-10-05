/**
 * Conversation orchestrator: intent -> deterministic answer -> optional LLM
 * phrasing -> shared conversation history (same thread across channels).
 */
import { analyzeCustomer } from "@/lib/engine";
import { getState, mutate, nextId } from "@/lib/services/store";
import type { ChatMessage } from "@/lib/types/chat";
import { getAdapter } from "./adapter";
import { draftAnswer } from "./fallback";
import { classifyIntent } from "./intents";
import { getActiveTenant } from "@/lib/tenant";
import { minimalFacts, rephrasePrompt, systemPrompt } from "./prompts";

const MAX_MESSAGE_LENGTH = 500;

export async function respond(message: string, channel: "app" | "whatsapp" = "app"): Promise<ChatMessage> {
  const text = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!text) throw new Error("Message is empty");

  const state = getState();
  const parsed = classifyIntent(text);
  const factId = nextId("fact");
  const draft = draftAnswer(parsed, analyzeCustomer(state), state, text, factId);

  mutate((s) => {
    s.conversation.push({ id: nextId("msg"), role: "user", text, channel, createdAt: new Date().toISOString() });
    if (draft.decision) s.lastDecision = { question: text, ...draft.decision, date: s.today };
    if (draft.fact && !s.memory.some((m) => m.fact === draft.fact!.fact.fact)) s.memory.push(draft.fact.fact);
  });

  let reply = draft.text;
  let source: ChatMessage["source"] = "deterministic";
  const adapter = getAdapter();
  if (adapter) {
    try {
      const tenant = getActiveTenant();
      reply = await adapter.complete(
        systemPrompt(tenant.bankName, tenant.productName, tenant.advisorLabel),
        rephrasePrompt(minimalFacts(analyzeCustomer(getState())), draft.text, text),
      );
      source = "llm";
    } catch (err) {
      console.warn("[copilot] LLM unavailable, using deterministic answer:", (err as Error).message);
    }
  }

  const assistant: ChatMessage = {
    id: nextId("msg"),
    role: "assistant",
    text: reply,
    blocks: draft.blocks,
    source,
    channel,
    createdAt: new Date().toISOString(),
  };
  mutate((s) => void s.conversation.push(assistant));
  return assistant;
}
