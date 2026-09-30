import type { UpcomingPayment } from "@/lib/types/domain";

/**
 * Known one-off / annual obligations. Monthly recurring payments are projected
 * separately from the recurring payment list.
 */
export const upcomingPayments: UpcomingPayment[] = [
  {
    id: "up-insurance",
    merchant: "Home contents & family liability (annual)",
    amount: 780,
    dueDate: "2026-10-02",
    category: "insurance",
    certainty: "predicted",
  },
  {
    id: "up-energy-settlement",
    merchant: "Voltera Energy annual settlement",
    amount: 240,
    dueDate: "2026-10-19",
    category: "utilities",
    certainty: "confirmed",
  },
];
