"use client";

import { ArrowLeft, CheckCheck, Phone, Video } from "lucide-react";
import type { ReactNode } from "react";
import { useTenant } from "@/components/providers/TenantProvider";

/** WhatsApp-styled phone frame. Visual simulation only - no real messaging integration. */
export function PhoneMockup({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const { tenant } = useTenant();
  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[44px] bg-ink p-3 shadow-lift">
      <div className="overflow-hidden rounded-[34px] bg-[#efeae2]">
        <div className="flex items-center gap-3 bg-[#075e54] px-4 pb-3 pt-6 text-white">
          <ArrowLeft size={18} />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[11px] font-bold text-brand">{tenant.monogram}</span>
          <div className="flex-1">
            <div className="text-[14px] font-semibold leading-tight">{tenant.bankName} Co-Pilot</div>
            <div className="text-[11px] text-white/70">Verified business account</div>
          </div>
          <Video size={17} />
          <Phone size={16} />
        </div>
        <div className="flex h-[440px] flex-col gap-2 overflow-y-auto px-3 py-4">{children}</div>
        {footer && <div className="border-t border-black/5 bg-[#f0f2f5] p-2.5">{footer}</div>}
      </div>
    </div>
  );
}

export function WaBubble({ text, time, fromUser }: { text: string; time: string; fromUser?: boolean }) {
  return (
    <div className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[13px] leading-snug text-[#111b21] shadow-sm ${fromUser ? "self-end rounded-tr-none bg-[#d9fdd3]" : "self-start rounded-tl-none bg-white"}`}>
      <span className="whitespace-pre-line">{text}</span>
      <span className="float-right ml-2 mt-1.5 flex items-center gap-0.5 text-[10px] text-slate-500">
        {time}
        {fromUser && <CheckCheck size={12} className="text-sky-500" />}
      </span>
    </div>
  );
}
