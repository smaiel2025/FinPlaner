/**
 * Core domain model for the Financial Co-Pilot.
 * These are the "raw" customer signals that a real KBC integration would supply.
 */

import type { ChatMessage } from "./chat";

export type ISODate = string; // YYYY-MM-DD

export type Category =
  | "salary"
  | "rent"
  | "groceries"
  | "restaurants"
  | "utilities"
  | "telecom"
  | "transport"
  | "subscriptions"
  | "shopping"
  | "entertainment"
  | "health"
  | "insurance"
  | "loan"
  | "savings_transfer";

export interface Transaction {
  id: string;
  date: ISODate;
  amount: number; // negative = outflow from current account
  category: Category;
  merchant: string;
  recurringId?: string;
  goalId?: string;
}

export type AccountType = "current" | "savings" | "investment";

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  balance: number;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  remaining: number;
  monthlyPayment: number;
  annualRate: number;
  endDate: ISODate;
}

export interface InsuranceProduct {
  id: string;
  name: string;
  type: "home" | "health" | "liability" | "travel";
  premium: number;
  frequency: "monthly" | "annual";
  nextDueDate: ISODate;
  coverage: string;
}

export interface RecurringPayment {
  id: string;
  merchant: string;
  category: Category;
  amount: number;
  dayOfMonth: number;
  essential: boolean;
  /** Price per month over time; used for "price increased" signals. */
  priceHistory: { from: ISODate; amount: number }[];
  /** Last time the service was used (synthetic usage signal for subscriptions). */
  lastUsed?: ISODate;
  status: "active" | "cancel_requested";
}

export interface UpcomingPayment {
  id: string;
  merchant: string;
  amount: number;
  dueDate: ISODate;
  category: Category;
  /** predicted = inferred from history; confirmed = invoice/payment request received. */
  certainty: "predicted" | "confirmed";
}

export type GoalType = "house" | "travel" | "emergency" | "car" | "education" | "retirement" | "wedding" | "investing";
export type Priority = "high" | "medium" | "low";

export interface GoalSnapshot {
  month: string; // YYYY-MM
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: ISODate;
  /** Target date originally agreed; used for "ahead/behind original plan". */
  originalTargetDate: ISODate;
  priority: Priority;
  monthlyContribution: number;
  /** Date of the next standing-order transfer into this goal. */
  nextTransferDate: ISODate;
  milestoneAmounts: number[];
  history: GoalSnapshot[];
  createdAt: ISODate;
}

export type RiskPreference = "cautious" | "balanced" | "growth";
export type Channel = "app" | "web" | "whatsapp" | "email" | "advisor";

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  ageRange: string;
  location: string;
  household: string;
  employment: string;
  monthlyNetIncome: number;
  incomeBand: string;
  riskPreference: RiskPreference;
  preferredChannel: Channel;
  /** The minimum balance the customer wants to keep on the current account. */
  safetyBuffer: number;
  memberSince: string;
}

export type Topic = "spending" | "saving" | "goals" | "bills" | "investing" | "insurance" | "milestones";
export type Frequency = "minimal" | "balanced" | "proactive";

export interface Preferences {
  /** Host switch. Off means the bank app stays as it is and the engine does not score. */
  copilotEnabled: boolean;
  proactiveEnabled: boolean;
  frequency: Frequency;
  channels: Record<"app" | "web" | "whatsapp" | "email", boolean>;
  topics: Record<Topic, boolean>;
  milestoneNotifications: boolean;
  progressReminders: boolean;
  consent: {
    transactionAnalysis: boolean;
    conversationMemory: boolean;
    messagingChannel: boolean;
  };
  /** Opportunity keys the customer asked never to see again. */
  neverRecommend: string[];
}

export interface ConversationFact {
  id: string;
  date: ISODate;
  statement: string;
  fact: string;
  status: "pending_confirmation" | "applied" | "noted";
  proposal?: { goalId: string; targetDate: ISODate; label: string };
}

export interface FeedbackRecord {
  key: string;
  outcome: "accepted" | "dismissed" | "never";
  date: ISODate;
}

export interface NotificationRecord {
  id: string;
  date: ISODate;
  channel: Channel;
  kind: "risk" | "opportunity" | "milestone";
  opportunityKey: string;
  title: string;
  body: string;
}

export interface ActionRecord {
  id: string;
  date: ISODate;
  title: string;
  changes: string[];
  goalId?: string;
}

export interface EventRecord {
  id: string;
  date: ISODate;
  type: string;
  label: string;
}

/** Everything the platform knows about one customer. */
export interface CustomerState {
  today: ISODate;
  profile: CustomerProfile;
  accounts: Account[];
  loans: Loan[];
  insurance: InsuranceProduct[];
  recurring: RecurringPayment[];
  upcoming: UpcomingPayment[];
  transactions: Transaction[];
  goals: Goal[];
  preferences: Preferences;
  memory: ConversationFact[];
  feedback: FeedbackRecord[];
  notifications: NotificationRecord[];
  actions: ActionRecord[];
  events: EventRecord[];
  /** Milestone keys already acknowledged, so recognition never repeats. */
  acknowledgedMilestones: string[];
  /** Most recent decision question from the conversation (contextual decision signal). */
  lastDecision?: { question: string; amount: number; purpose: string; date: ISODate };
  /** One continuous conversation shared by all channels. */
  conversation: ChatMessage[];
}
