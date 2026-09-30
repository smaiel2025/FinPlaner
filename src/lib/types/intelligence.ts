/**
 * Types produced by the intelligence engine (derived, never stored as source of truth).
 */
import type { Channel, Goal, ISODate, Topic } from "./domain";

export interface Signal {
  id: string;
  label: string;
  value: string;
  /** Observable fact phrased for customers ("Your latest energy payment was €164"). */
  customerText: string;
}

export type OpportunityType =
  | "spending_anomaly"
  | "excess_liquidity"
  | "goal_deviation"
  | "cashflow_risk"
  | "subscription"
  | "savings_opportunity"
  | "milestone"
  | "positive_behavior"
  | "contextual_decision";

export type Tone = "risk" | "opportunity" | "positive" | "info";

export interface RelevanceBreakdown {
  impact: number; // 0-100
  urgency: number;
  goalRelevance: number;
  confidence: number;
  /** % reduction applied to outbound messaging when the customer was contacted recently. */
  frequencyPenalty: number;
  score: number; // 0-100, decides in-app surfacing
  messagingScore: number; // score after frequency penalty, decides outbound messaging
  threshold: number;
  surfaced: boolean;
  suppressionReason?: string;
}

export interface ActionOption {
  id: string;
  label: string;
  description: string;
  kind: "transfer" | "adjust_contribution" | "cancel_subscription" | "reschedule_transfer" | "reminder" | "advisor" | "info" | "keep";
  amount?: number;
  goalId?: string;
  /** Trade-off phrased for the customer. */
  tradeOff?: string;
  impact?: GoalImpact;
  recommended?: boolean;
}

export interface GoalImpact {
  goalId: string;
  goalName: string;
  progressBefore: number; // 0-1
  progressAfter: number;
  projectedBefore: ISODate | null;
  projectedAfter: ISODate | null;
  /** Positive = earlier, negative = later, in weeks. */
  weeksShift: number;
}

export interface Opportunity {
  key: string; // stable identifier, e.g. "subscription:cinemax"
  type: OpportunityType;
  tone: Tone;
  topic: Topic;
  title: string;
  summary: string;
  event: string;
  signals: Signal[];
  context: string[];
  estimatedImpact: string;
  impactEuro?: number;
  nextBestAction: string;
  whyNow: string;
  actions: ActionOption[];
  relatedGoalId?: string;
  /** Set when this finding is already covered by a broader recommendation (prevents duplicates). */
  bundledInto?: string;
  detectedAt: ISODate;
  /** Raw scoring inputs (0-100) supplied by the detector. */
  inputs: { impact: number; urgency: number; goalRelevance: number; confidence: number };
}

export interface ScoredOpportunity extends Opportunity {
  relevance: RelevanceBreakdown;
  channel: Channel;
  channelReason: string;
}

export interface HealthFactor {
  id: "buffer" | "savings" | "debt" | "stability" | "goals";
  label: string;
  weight: number;
  score: number; // 0-100
  previousScore: number;
  detail: string;
}

export interface HealthScore {
  score: number;
  previous: number;
  change: number;
  label: "Needs attention" | "Building" | "Stable" | "Strong";
  factors: HealthFactor[];
  reasons: string[];
  history: { month: string; score: number }[];
}

export type MomentumState = "Improving" | "Steady" | "Slowing";

export interface Momentum {
  state: MomentumState;
  value: number; // 0-100
  message: string;
}

export interface GoalProjection {
  goal: Goal;
  progress: number; // 0-1
  remaining: number;
  requiredMonthly: number;
  projectedDate: ISODate | null;
  monthsAheadOfTarget: number; // negative = behind
  onTrack: boolean;
  likelihood: "High" | "Medium" | "Low";
  likelihoodPct: number;
  last90Days: number;
  nextMilestone: number | null;
  milestonesReached: number[];
}

export interface MilestoneEvent {
  key: string;
  goalId: string;
  label: string;
  amount: number;
  reachedOn: ISODate;
  message: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  earnedOn?: ISODate;
  progressText?: string;
}

export interface Streak {
  id: string;
  label: string;
  months: number;
  description: string;
}

export interface PersonalBest {
  id: string;
  label: string;
  detail: string;
}

export interface CashflowForecast {
  currentBalance: number;
  nextSalaryDate: ISODate;
  lowestProjected: number;
  lowestDate: ISODate;
  usualLowPoint: number;
  obligations: { label: string; amount: number; date: ISODate }[];
  monthlySurplus: number;
}

export interface SpendingCategory {
  category: string;
  thisMonth: number;
  average: number;
  changePct: number;
}

export interface FinancialProfile {
  netWorth: number;
  liquidity: number;
  monthlyIncome: number;
  essentialMonthly: number;
  discretionaryMonthly: number;
  savingsRate: number;
  debtRemaining: number;
  debtToIncome: number;
  emergencyMonths: number;
  spending: SpendingCategory[];
  monthlySpendingSeries: { month: string; essential: number; discretionary: number; saved: number }[];
  behaviorChanges: string[];
}
