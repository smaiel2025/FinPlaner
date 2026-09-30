# Assumptions

This is a demo, not a production scoring model. Every number is derived from the synthetic seed, not hardcoded into the UI.

## Data

- One customer (Sophie). Accounts, loans, insurance, recurring payments and six-plus months of transactions are generated with a seeded PRNG (`mulberry32`) so the dataset is stable across runs.
- Demo “today” is **2026-09-30**. Standing orders advance it to 2026-10-01.
- Salary €3,150 then **€3,400 from June 2026**. Safety buffer **€2,000** (customer-chosen, not a KBC rule).
- No interest, inflation, tax or investment return in projections. House/Japan/emergency pots grow only by contributions.

## Scoring

- Financial Health Score is a **POC progress indicator**, not a KBC metric and not a credit score. Weights: buffer 0.4, goals 0.25, stability 0.15, savings 0.1, debt 0.1.
- Relevance: `0.35·impact + 0.25·urgency + 0.25·goalRelevance + 0.15·confidence`. Thresholds: minimal 80, balanced 65, proactive 50.
- Frequency penalty affects **outbound messaging only**. In-app cards use the raw score.
- Predicted upcoming payments use low urgency/confidence so they stay quiet until confirmed.

## Where this demo differs from the original brief’s example numbers

The brief mixed a few internally inconsistent examples. The engine uses linear remaining ÷ monthly arithmetic, so:

| Topic | Brief example | Engine on this seed |
| --- | --- | --- |
| House after both hero changes | Back to ~March 2030 | **September 2029** (€149/month extra overshoots the original target) |
| Health score change | loosely “up a few points” | **76, +4** vs previous month |
| €1,500 holiday | “a couple of weeks” | **~2 weeks** (`REFILL_MONTHS = 6`) |
| €2,000 holiday | “about 6 weeks” | **~6 weeks** |
| Surplus redirect | €120 | **€120** (60% of typical surplus, rounded to €10) |

Cancelling CineMax+ alone lands the house around **March 2030**.

## AI

- Without API keys the Co-Pilot is deterministic. An LLM never computes balances, scores or eligibility.
- Conversation memory stores customer-stated facts (e.g. a 2029 house date) only with consent, and only after the customer confirms an update.

## Channels

- WhatsApp is a **visual simulation**. No messages leave this process.
- Advisor call is a toast, not a booking system.
