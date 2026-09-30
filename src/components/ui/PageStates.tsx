"use client";

import type { ReactNode } from "react";
import { useCopilot } from "@/components/providers/CopilotProvider";
import type { Snapshot } from "@/lib/api/snapshot";
import { Button, Skeleton } from "./primitives";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-[14px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Renders children only once the customer snapshot is available. */
export function WithSnapshot({ children }: { children: (s: Snapshot) => ReactNode }) {
  const { snapshot, error, refresh } = useCopilot();
  if (error && !snapshot) {
    return (
      <div className="rounded-2xl border border-risk/20 bg-risk-50 p-6 text-sm text-risk">
        Could not load your data: {error}
        <Button size="sm" variant="secondary" className="ml-3" onClick={() => void refresh()}>Retry</Button>
      </div>
    );
  }
  if (!snapshot) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-44 lg:col-span-2" />
        <Skeleton className="h-44" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    );
  }
  return <>{children(snapshot)}</>;
}
