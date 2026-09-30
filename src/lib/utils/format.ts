import type { ISODate } from "@/lib/types/domain";
import { parseDate } from "./dates";

const euro0 = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const euro2 = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

export function eur(amount: number, decimals = false): string {
  return (decimals ? euro2 : euro0).format(amount);
}

export function pct(ratio: number, digits = 0): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function monthYear(iso: ISODate | null): string {
  if (!iso) return "Not projected";
  return parseDate(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function shortDate(iso: ISODate): string {
  return parseDate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function longDate(iso: ISODate): string {
  return parseDate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function monthLabel(key: string): string {
  return parseDate(`${key}-01`).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
}

export function weeksPhrase(weeks: number): string {
  const w = Math.abs(Math.round(weeks));
  if (w === 0) return "no meaningful change";
  if (w >= 9) {
    const months = Math.round(w / 4.345);
    return `~${months} month${months === 1 ? "" : "s"}`;
  }
  return `~${w} week${w === 1 ? "" : "s"}`;
}

export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}
