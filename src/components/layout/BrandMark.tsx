"use client";

import { useEffect, useRef, useState } from "react";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { useTenant } from "@/components/providers/TenantProvider";
import { CopilotSwitch } from "./CopilotSwitch";

/** Same identity line on every bank: name, product, switch, then the demo bank picker. */
export function BrandMark() {
  const { tenant, tenants, setTenant } = useTenant();
  const { refresh, notify } = useCopilot();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 224;
      setMenuPos({ top: rect.bottom + 8, left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) });
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    place();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const choose = async (id: string) => {
    setOpen(false);
    if (id === tenant.id) return;
    try {
      await setTenant(id);
      await refresh();
    } catch (e) {
      notify((e as Error).message, "risk");
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap sm:gap-2.5">
      <span className="text-[17px] font-extrabold tracking-tight text-brand sm:text-[22px]">{tenant.bankName}</span>
      <span className="text-[13px] font-semibold text-ink sm:text-[14px]">{tenant.productName}</span>
      <CopilotSwitch />
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          ref={buttonRef}
          aria-label="Choose the bank to demonstrate"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full bg-attention-50 px-2.5 py-1 text-[11px] font-medium text-attention"
        >
          Prototype
        </button>
        {open && (
          <ul
            role="listbox"
            aria-label="Bank to demonstrate"
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed z-40 w-56 rounded-xl border border-line bg-white p-1 shadow-lift"
          >
            {tenants.map((item) => {
              const selected = item.id === tenant.id;
              return (
                <li key={item.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => void choose(item.id)}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-[13px] ${selected ? "bg-brand-50 font-semibold text-brand" : "text-ink hover:bg-surface"}`}
                  >
                    {item.bankName}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
