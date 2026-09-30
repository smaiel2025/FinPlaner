"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api/client";
import type { Snapshot } from "@/lib/api/snapshot";
import type { ApprovalResult } from "@/lib/services/actions";
import type { Preferences } from "@/lib/types/domain";
import type { ScoredOpportunity } from "@/lib/types/intelligence";

interface Toast {
  id: number;
  message: string;
  tone: "positive" | "info" | "risk";
}

interface CopilotContextValue {
  snapshot: Snapshot | null;
  error: string | null;
  refresh: () => Promise<void>;
  why: ScoredOpportunity | null;
  openWhy: (o: ScoredOpportunity | null) => void;
  review: ScoredOpportunity | null;
  openReview: (o: ScoredOpportunity | null) => void;
  approve: (key: string, actionIds: string[]) => Promise<ApprovalResult>;
  feedback: (key: string, outcome: "dismissed" | "never") => Promise<void>;
  trigger: (event: "insurance_invoice" | "standing_orders" | "reset") => Promise<string>;
  updatePreferences: (patch: Partial<Preferences>) => Promise<void>;
  toast: Toast | null;
  notify: (message: string, tone?: Toast["tone"]) => void;
  /** Incremented whenever server state changes, so pages can refetch their own data. */
  version: number;
}

const CopilotContext = createContext<CopilotContextValue | null>(null);

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [why, openWhy] = useState<ScoredOpportunity | null>(null);
  const [review, openReview] = useState<ScoredOpportunity | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setSnapshot(await api<Snapshot>("/api/profile"));
      setError(null);
      setVersion((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const notify = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = Date.now();
    setToast({ id, message, tone });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 4200);
  }, []);

  const approve = useCallback(
    async (key: string, actionIds: string[]) => {
      const result = await api<ApprovalResult>("/api/actions", { method: "POST", json: { opportunityKey: key, actionIds, approved: true } });
      await refresh();
      return result;
    },
    [refresh],
  );

  const feedback = useCallback(
    async (key: string, outcome: "dismissed" | "never") => {
      await api(`/api/recommendations/${encodeURIComponent(key)}/feedback`, { method: "POST", json: { outcome } });
      notify(outcome === "never" ? "Understood - we won't suggest this again." : "Okay, we'll leave this for now.");
      await refresh();
    },
    [refresh, notify],
  );

  const trigger = useCallback(
    async (event: "insurance_invoice" | "standing_orders" | "reset") => {
      const res = await api<{ label: string }>("/api/events", { method: "POST", json: { event } });
      await refresh();
      return res.label;
    },
    [refresh],
  );

  const updatePreferences = useCallback(
    async (patch: Partial<Preferences>) => {
      await api("/api/preferences", { method: "PATCH", json: patch });
      await refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({ snapshot, error, refresh, why, openWhy, review, openReview, approve, feedback, trigger, updatePreferences, toast, notify, version }),
    [snapshot, error, refresh, why, review, approve, feedback, trigger, updatePreferences, toast, notify, version],
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used inside CopilotProvider");
  return ctx;
}
