"use client";

import { ArrowUp, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { MessageBubble, TypingIndicator } from "@/components/chat/MessageBubble";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { useTenant } from "@/components/providers/TenantProvider";
import { api } from "@/lib/api/client";
import type { ChatMessage } from "@/lib/types/chat";

const STARTERS = [
  "Can I afford a €2,000 holiday next month?",
  "Why am I spending more this month?",
  "How much should I save every month if I want to buy a house in 3 years?",
  "Can I buy this car without hurting my other goals?",
  "How am I doing on my goals?",
  "Why did my score change?",
];

function CopilotChat() {
  const params = useSearchParams();
  const router = useRouter();
  const { refresh, notify, snapshot } = useCopilot();
  const { tenant } = useTenant();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const autoSent = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fromWhatsApp = params.get("thread") === "insurance";

  useEffect(() => {
    api<{ messages: ChatMessage[] }>("/api/chat")
      .then((r) => setMessages(r.messages))
      .catch((e) => notify(e.message, "risk"))
      .finally(() => setLoaded(true));
  }, [notify]);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [messages, pending]);

  const send = useCallback(
    async (text: string) => {
      if (text === "__advisor__") {
        notify("Advisor call requested - an advisor will contact you via your preferred channel (simulated).", "positive");
        return;
      }
      const trimmed = text.trim();
      if (!trimmed || pending) return;
      setInput("");
      setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "user", text: trimmed, channel: "app", createdAt: new Date().toISOString() }]);
      setPending(true);
      try {
        const { reply } = await api<{ reply: ChatMessage }>("/api/chat", { method: "POST", json: { message: trimmed } });
        setMessages((m) => [...m, reply]);
        await refresh();
      } catch (e) {
        notify((e as Error).message, "risk");
      } finally {
        setPending(false);
      }
    },
    [pending, refresh, notify],
  );

  useEffect(() => {
    if (!loaded || autoSent.current) return;
    const q = params.get("q") ?? (fromWhatsApp ? "Show me my options for the insurance payment" : null);
    if (q) {
      autoSent.current = true;
      router.replace(fromWhatsApp ? "/copilot?thread=insurance" : "/copilot", { scroll: false });
      void send(q);
    }
  }, [loaded, params, fromWhatsApp, router, send]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink"><Sparkles size={20} className="text-brand" /> Financial Co-Pilot</h1>
          <p className="mt-1 text-[13px] text-muted">Answers use your (synthetic) account data. Suggestions only - you always decide.</p>
        </div>
      </div>

      {fromWhatsApp && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-growth/20 bg-growth-50 px-4 py-2.5 text-[13px] text-ink">
          <MessageCircle size={15} className="text-growth" /> Continued from WhatsApp - same conversation, same context.
        </div>
      )}

      <div className="flex-1 space-y-5 pb-4">
        {loaded && messages.length === 0 && !pending && (
          <div className="rounded-3xl border border-line bg-white p-6">
            <div className="text-[15px] font-medium text-ink">Hi {snapshot?.context.profile.firstName ?? "there"}, what would you like to figure out?</div>
            <p className="mt-1 text-[13px] text-muted">I can check affordability, explain spending changes, plan goals and show your progress.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-line px-3 py-1.5 text-left text-[13px] text-ink hover:border-brand hover:text-brand">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => <MessageBubble key={m.id} message={m} onSuggest={send} />)}
        {pending && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-16 -mx-2 bg-gradient-to-t from-surface via-surface to-transparent px-2 pb-4 pt-6 lg:bottom-0">
        {messages.length > 0 && (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {STARTERS.slice(0, 4).map((s) => (
              <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border border-line bg-white px-3 py-1 text-[12px] text-slate-600 hover:border-brand hover:text-brand">{s}</button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-5 shadow-card focus-within:border-brand"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder="Ask about a purchase, your spending or your goals..."
            className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-slate-400"
            aria-label="Message the Co-Pilot"
          />
          <button type="submit" disabled={!input.trim() || pending} className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white disabled:opacity-40" aria-label="Send">
            <ArrowUp size={17} />
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck size={11} /> {tenant.disclaimer}
        </div>
      </div>
    </div>
  );
}

export default function CopilotPage() {
  return (
    <Suspense>
      <CopilotChat />
    </Suspense>
  );
}
