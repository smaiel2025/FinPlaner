"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { useTenant } from "@/components/providers/TenantProvider";
import type { ChatMessage } from "@/lib/types/chat";
import { BlockView } from "./Blocks";

export function MessageBubble({ message, onSuggest }: { message: ChatMessage; onSuggest: (t: string) => void }) {
  const { tenant } = useTenant();
  const isUser = message.role === "user";
  const fromWhatsApp = message.channel === "whatsapp";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={clsx("flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sky">
          <Sparkles size={15} />
        </span>
      )}
      <div className={clsx("min-w-0", isUser ? "max-w-[80%]" : "w-full max-w-3xl")}>
        {fromWhatsApp && (
          <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-growth">
            <MessageCircle size={12} /> Sent via WhatsApp
          </div>
        )}
        <div
          className={clsx(
            "whitespace-pre-line rounded-2xl px-4 py-3 text-[14px] leading-relaxed",
            isUser ? "rounded-br-md bg-brand text-white" : "rounded-tl-md border border-line bg-white text-ink",
          )}
        >
          {message.text}
        </div>
        {message.blocks?.length ? (
          <div className="mt-3 space-y-3">
            {message.blocks.map((b, i) => <BlockView key={i} block={b} onSuggest={onSuggest} />)}
          </div>
        ) : null}
        {!isUser && message.source && (
          <div className="mt-1.5 text-[10px] text-slate-400">{message.source === "llm" ? `Phrased by LLM · numbers from the ${tenant.bankName} engine` : `Deterministic answer · numbers from the ${tenant.bankName} engine`}</div>
        )}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sky"><Sparkles size={15} /></span>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3">
        {[0, 1, 2].map((i) => <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>
    </div>
  );
}
