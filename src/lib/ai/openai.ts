import type { LLMAdapter } from "./adapter";

interface Options {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs?: number;
}

/** Minimal OpenAI-compatible chat completions client (no SDK dependency). */
export class OpenAICompatibleAdapter implements LLMAdapter {
  readonly name: string;

  constructor(private readonly options: Options) {
    this.name = `openai-compatible:${options.model}`;
  }

  async complete(system: string, user: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 8000);
    try {
      const res = await fetch(`${this.options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.options.apiKey}` },
        body: JSON.stringify({
          model: this.options.model,
          temperature: 0.3,
          max_tokens: 350,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`LLM request failed with status ${res.status}`);
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("LLM returned an empty response");
      return text;
    } finally {
      clearTimeout(timer);
    }
  }
}
