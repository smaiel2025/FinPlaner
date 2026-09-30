import type { Opportunity } from "@/lib/types/intelligence";
import { eur, longDate, monthYear, pct } from "@/lib/utils/format";
import { energyActions } from "../nba";
import { primaryGoal } from "../simulate";
import { avg, priceIncreases, spendingComparison, unusedSubscriptions } from "../signals";
import { base, type Detector } from "./shared";

export const energyAnomaly: Detector = (state) => {
  const payments = state.transactions.filter((t) => t.recurringId === "rec-energy").map((t) => -t.amount);
  if (payments.length < 4) return [];
  const latest = payments[payments.length - 1];
  const average = Math.round(avg(payments.slice(-7, -1)));
  const change = (latest - average) / average;
  if (change < 0.2) return [];
  const yearly = Math.round((latest - average) * 12);
  const house = primaryGoal(state);
  return [{
    ...base(state),
    key: "spending_anomaly:energy",
    type: "spending_anomaly",
    tone: "info",
    topic: "bills",
    title: `Your electricity bill increased by ${pct(change)}`,
    summary: `Your latest energy payment was ${eur(latest)} versus a 6-month average of ${eur(average)}. If this continues it adds about ${eur(yearly)} a year.`,
    event: `Energy payment: ${eur(latest)}`,
    signals: [
      { id: "avg", label: "6-month average", value: eur(average), customerText: `Your average monthly energy payment was ${eur(average)}.` },
      { id: "latest", label: "Latest payment", value: eur(latest), customerText: `Your latest payment was ${eur(latest)}.` },
      { id: "change", label: "Change", value: `+${pct(change)}`, customerText: `That is a ${pct(change)} increase.` },
      { id: "goal", label: "Goal link", value: house.name, customerText: `Reducing recurring costs supports your ${eur(house.targetAmount)} ${house.name.toLowerCase()} goal.` },
    ],
    context: [`${house.name} goal active`, "Recurring essential cost", "Annual energy settlement also due this month"],
    estimatedImpact: `${eur(yearly)}/year if it persists`,
    impactEuro: yearly,
    nextBestAction: "Explain the increase and suggest reviewing the energy contract",
    whyNow: "Recurring cost jump with ongoing yearly impact and a relevant active goal",
    actions: energyActions(),
    relatedGoalId: house.id,
    inputs: { impact: Math.min(100, 25 + yearly / 12), urgency: 50, goalRelevance: 70, confidence: 90 },
  }];
};

export const restaurantAnomaly: Detector = (state) => {
  const c = spendingComparison(state).find((x) => x.category === "restaurants");
  if (!c || c.average < 50 || c.changePct < 0.25) return [];
  const diff = c.thisMonth - c.average;
  return [{
    ...base(state),
    key: "spending_anomaly:restaurants",
    type: "spending_anomaly",
    tone: "info",
    topic: "spending",
    title: `Restaurant spending is ${pct(c.changePct)} above your usual`,
    summary: `You spent ${eur(c.thisMonth)} on restaurants this month, versus ${eur(c.average)} on average.`,
    event: `Restaurant spending: ${eur(c.thisMonth)} this month`,
    signals: [
      { id: "avg", label: "6-month average", value: eur(c.average), customerText: `You usually spend about ${eur(c.average)} a month on restaurants.` },
      { id: "latest", label: "This month", value: eur(c.thisMonth), customerText: `This month it was ${eur(c.thisMonth)}.` },
    ],
    context: ["Flexible spending - the customer's own choice", "Likely temporary"],
    estimatedImpact: `${eur(diff)} above usual this month`,
    impactEuro: diff,
    nextBestAction: "Explain only when asked - no interruption",
    whyNow: "Moderate, likely temporary deviation",
    actions: [],
    inputs: { impact: Math.min(100, 20 + diff * 0.6), urgency: 35, goalRelevance: 60, confidence: 75 },
  }];
};

export const subscriptions: Detector = (state) => {
  const hero = `goal_deviation:${primaryGoal(state).id}`;
  const unused: Opportunity[] = unusedSubscriptions(state).map(({ recurring: r, daysUnused }) => ({
    ...base(state),
    key: `subscription_unused:${r.id}`,
    type: "subscription",
    tone: "opportunity",
    topic: "spending",
    title: `${r.merchant} has not been used for ${Math.round(daysUnused / 30)} months`,
    summary: `You pay ${eur(r.amount, true)}/month (${eur(r.amount * 12)}/year) for a service you have not used since ${longDate(r.lastUsed!)}.`,
    event: `Recurring charge: ${r.merchant} ${eur(r.amount, true)}`,
    signals: [{ id: "unused", label: "Last used", value: r.lastUsed!, customerText: `Last used on ${longDate(r.lastUsed!)}.` }],
    context: ["Non-essential recurring cost"],
    estimatedImpact: `${eur(r.amount * 12)}/year`,
    impactEuro: r.amount * 12,
    nextBestAction: "Suggest cancelling and redirecting to a goal",
    whyNow: "Charge continues without usage",
    actions: [],
    bundledInto: hero,
    inputs: { impact: Math.min(100, 25 + r.amount), urgency: 45, goalRelevance: 80, confidence: 80 },
  }));
  const increases: Opportunity[] = priceIncreases(state)
    .filter((x) => x.recurring.category === "subscriptions")
    .map((x) => ({
      ...base(state),
      key: `subscription_price:${x.recurring.id}`,
      type: "subscription",
      tone: "info",
      topic: "spending",
      title: `${x.recurring.merchant} increased its price by ${pct(x.changePct)}`,
      summary: `From ${eur(x.from, true)} to ${eur(x.to, true)} per month since ${monthYear(x.since)}.`,
      event: `Price change: ${x.recurring.merchant}`,
      signals: [{ id: "price", label: "Price change", value: `${eur(x.from, true)} → ${eur(x.to, true)}`, customerText: `The monthly price went from ${eur(x.from, true)} to ${eur(x.to, true)}.` }],
      context: ["Service still actively used"],
      estimatedImpact: `${eur((x.to - x.from) * 12)}/year`,
      impactEuro: (x.to - x.from) * 12,
      nextBestAction: "No interruption - small impact and the service is used",
      whyNow: "Low impact",
      actions: [],
      inputs: { impact: Math.min(100, 20 + (x.to - x.from) * 3), urgency: 20, goalRelevance: 30, confidence: 90 },
    }));
  return [...unused, ...increases];
};
