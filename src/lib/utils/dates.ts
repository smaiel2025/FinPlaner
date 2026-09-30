import type { ISODate } from "@/lib/types/domain";

const DAY_MS = 86_400_000;
export const AVG_DAYS_PER_MONTH = 30.4375;

export function parseDate(iso: ISODate): Date {
  return new Date(`${iso}T12:00:00Z`);
}

export function toISO(d: Date): ISODate {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: ISODate, days: number): ISODate {
  return toISO(new Date(parseDate(iso).getTime() + days * DAY_MS));
}

export function addMonths(iso: ISODate, months: number): ISODate {
  const d = parseDate(iso);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return toISO(d);
}

/** Adds fractional months, using an average month length for the remainder. */
export function addFractionalMonths(iso: ISODate, months: number): ISODate {
  return addDays(iso, Math.round(months * AVG_DAYS_PER_MONTH));
}

export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / DAY_MS);
}

export function monthsBetween(a: ISODate, b: ISODate): number {
  return daysBetween(a, b) / AVG_DAYS_PER_MONTH;
}

export function monthKey(iso: ISODate): string {
  return iso.slice(0, 7);
}

/** Last `count` month keys ending with the month of `iso` (oldest first). */
export function recentMonthKeys(iso: ISODate, count: number): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) keys.push(monthKey(addMonths(`${monthKey(iso)}-01`, -i)));
  return keys;
}

export function weekdayName(iso: ISODate): string {
  return parseDate(iso).toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
}
