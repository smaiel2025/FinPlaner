# Production roadmap

The POC proves the intelligence loop on one synthetic customer. Scaling to ~2.3M KBC customers is an **event-driven** problem, not a nightly batch over everyone.

## 1. Event-driven evaluation

| Concern | POC | Production |
| --- | --- | --- |
| Trigger | Demo buttons + page load | Transaction posted, invoice received, salary credited, goal edited |
| Evaluation | Full recompute for Sophie | Only detectors subscribed to that event type, for that customer |
| Features | Derived in memory | Feature store: daily aggregates + streaming deltas |
| Gating | Relevance + anti-spam rules | Same rules + global contact caps + A/B thresholds |
| Language | Templates; optional LLM rephrase | LLM only when the customer opens or asks — never for scoring |
| Delivery | Simulated WhatsApp | Channel gateway, consent registry, delivery receipts |

Illustrative sizing (not measured KBC figures): ~1.5 relevant events/customer/day → ~3.5M deterministic evaluations/day. If ~3% surface an insight, ~100K deliveries/day. LLM load stays in the low tens of thousands/day if reserved for chat.

## 2. Hybrid AI split (keep this)

- **Engine (required):** balances, forecasts, health factors, relevance, eligibility, action payloads. Testable, auditable, cheap.
- **LLM (optional):** intent understanding and phrasing on a **minimal fact pack**. Timeout and fallback already exist in the adapter.
- Never send full transaction history to a model. Never let the model invent amounts or approve actions.

## 3. Platform steps

1. Replace `store.ts` / mock services with customer, payment and goal APIs behind the same interfaces (`CustomerService`, `GoalService`, `TransactionService`).
2. Persist notifications, feedback, memory and actions; use them as the anti-spam and learning loop.
3. Run detectors as isolated functions with versioned configs so risk can disable a rule without a deploy of the chat UI.
4. Human advisor workspace: same trace as `/intelligence`, plus case notes and regulated-product workflows.
5. Observability: score distributions, suppression reason rates, approval rates, false-positive reviews.

## 4. Responsible AI (already in the POC, keep as product requirements)

- Explicit approval before any money movement or standing-order change.
- “Why am I seeing this?” with signals, context and estimated impact.
- Customer controls: frequency, topics, channels, consent, forget, never-recommend.
- No gamification of app usage; milestones are financial outcomes only.
- Clear prototype / not-advice labelling until compliance signs off a real metric.
