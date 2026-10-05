"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api/client";
import { kbc, type Tenant } from "@/lib/tenant";

interface TenantContextValue {
  tenant: Tenant;
  tenants: { id: string; bankName: string }[];
  setTenant: (id: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | null>(null);

function applyTheme(tenant: Tenant) {
  const root = document.documentElement;
  root.style.setProperty("--color-ink", tenant.colors.ink);
  root.style.setProperty("--color-ink-soft", tenant.colors.ink);
  root.style.setProperty("--color-brand", tenant.colors.brand);
  root.style.setProperty("--color-brand-600", tenant.colors.brand600);
  root.style.setProperty("--color-brand-50", tenant.colors.brand50);
  root.style.setProperty("--color-brand-100", tenant.colors.brand50);
  document.title = `${tenant.bankName} ${tenant.productName} · Hackathon prototype`;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [tenant, setTenantState] = useState<Tenant>(kbc);
  const [tenants, setTenants] = useState<{ id: string; bankName: string }[]>([{ id: kbc.id, bankName: kbc.bankName }]);

  useEffect(() => {
    api<{ tenant: Tenant; tenants: { id: string; bankName: string }[] }>("/api/tenant")
      .then((r) => {
        setTenantState(r.tenant);
        setTenants(r.tenants);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    applyTheme(tenant);
  }, [tenant, pathname]);

  const setTenant = useCallback(async (id: string) => {
    const r = await api<{ tenant: Tenant }>("/api/tenant", { method: "POST", json: { id } });
    setTenantState(r.tenant);
  }, []);

  const value = useMemo(() => ({ tenant, tenants, setTenant }), [tenant, tenants, setTenant]);
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used inside TenantProvider");
  return ctx;
}
