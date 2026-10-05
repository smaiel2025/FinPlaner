import type { Tenant } from "./types";
import { argenta } from "./argenta";
import { belfius } from "./belfius";
import { bnp } from "./bnp";
import { ing } from "./ing";
import { kbc } from "./kbc";

export type { Tenant, TenantColors } from "./types";
export { argenta } from "./argenta";
export { belfius } from "./belfius";
export { bnp } from "./bnp";
export { ing } from "./ing";
export { kbc } from "./kbc";

export const TENANTS: Tenant[] = [kbc, ing, argenta, belfius, bnp];

const globalTenant = globalThis as unknown as { __copilotTenantId?: string };

export function getActiveTenant(): Tenant {
  const id = globalTenant.__copilotTenantId ?? "kbc";
  return TENANTS.find((t) => t.id === id) ?? kbc;
}

export function setActiveTenant(id: string): Tenant {
  const tenant = TENANTS.find((t) => t.id === id);
  if (!tenant) throw new Error(`Unknown bank skin: ${id}`);
  globalTenant.__copilotTenantId = tenant.id;
  return tenant;
}
