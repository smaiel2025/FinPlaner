# KBC Financial Co-Pilot

A financial co-pilot that notices what actually matters in a customer’s money, explains it in plain language, and never acts without their approval.

This is a **hackathon prototype** built around one synthetic KBC customer. It is not an official KBC product, not a credit score, and not financial advice. Every figure you see is computed from demo data.

---

## The idea

Most banking “insights” fail in one of two ways. They interrupt people with noise, or they hide the reasoning so the customer cannot tell a real signal from a sales push.

The Co-Pilot is the opposite of that:

- It watches **signals** (balances, bills, spending, goals), not app usage.
- It builds a reusable **financial profile** and only then looks for opportunities — a slipped goal, a cashflow squeeze, unused spending, a milestone worth celebrating.
- A **relevance gate** decides whether this is worth Sophie’s attention *right now*. Most findings stay quiet on purpose.
- When something does surface, she gets a **next best action with trade-offs**, not a single “do this” button.
- **Nothing moves money until she approves it.** Then progress is visible: the house timeline shifts, the health score can be explained, a milestone can be recognised.

Language is the last step, not the first. A deterministic engine owns every number, score, forecast and eligibility decision. A language model, if you turn one on, may only rephrase those facts. If the model is missing or fails, the demo still runs.

```
Signals → Profile → Opportunity → Relevance → Next best action → Channel → Approval → Progress
```

That loop is the product. The screens are how you watch it happen.

---

## Why this matters for a bank

KBC already has the data. The hard problem is using it **selectively, explainably, and at scale**.

| Principle | What you should see in the demo |
| --- | --- |
| Fewer, better interruptions | Unused CineMax+ is bundled into the house-goal recommendation, not sent as a second ping. Predicted insurance stays silent until the invoice is confirmed. |
| Customer in control | Frequency, topics, channels, consent, “forget this”, “never recommend this again”. |
| Explainability | Every card has **Why am I seeing this?** — the observable signals, not a black box. |
| Responsible progress | Milestones, streaks and personal bests compare Sophie only to her own history. No points for opening the app. |
| Hybrid AI that can scale | Scoring is cheap TypeScript. An LLM is optional and never sees the full transaction history. The same engine could evaluate events per customer rather than batching 2.3M people every night. |
| One conversation, several doors | Urgent risk can arrive on WhatsApp; the rest stays in the app. Tapping **Show options** continues the same thread. |

The **Intelligence view** (behind the scenes) is for jurors and builders: live decision traces, a relevance-threshold slider, and the event-driven story for millions of customers.

---

## Meet Sophie

**Sophie Peeters**, 34, Ghent. UX researcher. Demo date: **Wednesday 30 September 2026**.

She is saving for a house, a trip to Japan, and an emergency fund. After a salary rise she has a little unallocated surplus. Her house deposit has drifted about two months behind. An unused cinema subscription is still leaving every month. A €780 home-insurance payment is due Friday — the engine can see it coming, but it will not bother her until the insurer actually asks.

Four moments tell the whole story. Use the **Demo director** (bottom-right) to play them in order; **Reset demo** restores the seed.

1. **Get the house back on track.** The Co-Pilot offers two changes: cancel unused CineMax+ (€29/month) and redirect typical surplus (€120/month). Together the projected date moves from May 2030 toward September 2029. Her emergency fund is not touched. She reviews, then **approves**.
2. **Can I afford a €2,000 holiday next month?** Not a yes/no. Three options with the cost in *weeks of house-goal delay*, plus the signals used to check it.
3. **The invoice arrives while she is not in the app.** Confirmation raises urgency. WhatsApp is allowed because she opted in and the payment is due within three days. **Show options** continues in the Co-Pilot with full context.
4. **The next morning, standing orders run.** The emergency fund crosses 75%. That is celebrated **in the app**. WhatsApp stays quiet — she was already contacted yesterday. That is the anti-spam rule working, not a bug.

Step-by-step presenter notes: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

---

## What you can open

| Screen | What it is for |
| --- | --- |
| Overview `/` | The morning briefing: health, goals, and only what passed the relevance gate. |
| Co-Pilot `/copilot` | Ask about a purchase, spending, or a goal. Answers come as cards, not walls of text. |
| Goals `/goals` | Journeys, projections, what-if on a single goal. |
| Health `/health` | A **demo metric** (not an official KBC score) broken into five weighted factors. |
| Progress `/progress` | Milestones, achievements, responsible streaks, personal bests. |
| Insights `/insights` | The feed, plus a quiet list of things the engine saw and chose not to interrupt her with. |
| Messaging `/channels` | WhatsApp simulation and the routing rules. |
| AI controls `/settings` | How, when, and whether the Co-Pilot may speak. |
| Intelligence `/intelligence` | Why a finding surfaced or was suppressed. For the jury, not for Sophie. |

Customer state lives in memory on the Next.js server. Refreshing a page keeps the story; resetting starts Sophie over.

---

## Run the prototype

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No API key is required.

```bash
npm test          # engine, fallback answers, approval flow
npm run typecheck
npm run lint
npm run build
```

### Optional: LLM phrasing only

Copy `.env.example` to `.env.local`. Set `LLM_PROVIDER=openai` and `OPENAI_API_KEY` (any OpenAI-compatible endpoint works). The model receives a **short fact pack** and returns wording. Amounts, scores and “should we notify?” still come from the engine. Without those variables, a rule-based classifier covers every demo question.

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · Recharts · Framer Motion · Zod · Vitest

## Further reading

- [Architecture](docs/ARCHITECTURE.md) — modules, relevance formula, APIs
- [Demo script](docs/DEMO_SCRIPT.md) — eight-minute walkthrough
- [Assumptions](docs/ASSUMPTIONS.md) — seed data, scoring, where demo numbers differ from early examples
- [Production roadmap](docs/PRODUCTION_ROADMAP.md) — event-driven evaluation at 2.3M customers
