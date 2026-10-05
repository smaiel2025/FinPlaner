"use client";

import clsx from "clsx";
import { useCopilot } from "@/components/providers/CopilotProvider";
import { useTenant } from "@/components/providers/TenantProvider";

/** Host switch for the co-pilot. Sits beside the product name. */
export function CopilotSwitch() {
  const { snapshot, updatePreferences, notify } = useCopilot();
  const { tenant } = useTenant();
  const on = snapshot?.context.preferences.copilotEnabled !== false;

  const toggle = async () => {
    try {
      await updatePreferences({ copilotEnabled: !on });
    } catch (e) {
      notify((e as Error).message, "risk");
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${tenant.productName} ${on ? "on" : "off"}`}
      onClick={() => void toggle()}
      className={clsx(
        "relative h-7 w-14 shrink-0 rounded-full transition-colors",
        on ? "bg-[#34c759]" : "bg-[#ececec] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]",
      )}
    >
      <span
        className={clsx(
          "absolute top-1/2 -translate-y-1/2 text-[9px] font-extrabold tracking-wide",
          on ? "left-2 text-[#1b7a34]" : "right-1.5 text-[#c8c8c8]",
        )}
      >
        {on ? "ON" : "OFF"}
      </span>
      <span
        className={clsx(
          "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.12)] transition-[left]",
          on ? "left-7" : "left-0.5",
        )}
      />
    </button>
  );
}
