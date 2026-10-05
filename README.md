# Financial Co-Pilot

A white-label service a bank plugs into its own app. It notices what actually matters in a customer’s money, explains it in plain language, and waits for their approval before anything moves.

The bank keeps its app, its brand, and the decision of when the Co-Pilot is on. We supply the intelligence loop, wearing that bank’s name, and a set of plugins the bank turns on to match its products and its risk policy.

You can walk the service today with one synthetic customer, Sophie Peeters, inside **KBC, ING, Argenta, Belfius, or BNP Paribas Fortis**. Every figure is computed from her story. This service is not an official product of those banks, not a credit score, and not financial advice. The wordmarks are plain text inspired by each bank’s public site.

---

## The vision

The next generation of a bank app is **agentic**. It remains the customer’s bank, and it becomes a partner in their money: more **interactive**, and more **proactive**.

**Interactive.** The customer asks a real question — a holiday, a purchase, a goal — and gets a conversation: options, trade-offs, and a clear way to approve or leave it. That thread continues in the app and on the bank’s messaging channel.

**Proactive.** The app speaks first when something in their finances deserves it. A goal slipping, a bill that would break their safety balance, surplus that could close the gap, a milestone worth recognising. It picks the moment, explains why, and waits for them.

Financial Co-Pilot is how a bank reaches that app from the one customers already open. White-label, so it wears the bank. Plugin by plugin, so the bank chooses how agentic it becomes.

---

## What a bank buys

Two parts. One loop.

**White-label.** The experience wears the bank: name, colours, channels, advisor, disclaimer, and the explanation of which data is used. In the bank’s own app, one switch turns the Co-Pilot on or off. On a phone it fills the screen, with a way back to the bank. On a desktop it sits beside the bank’s own screens. With the switch off, the customer stays in the bank app and the intelligence stays quiet. The walkthrough you can run here is that full-screen experience, already wearing each bank’s header.

**Plugins.** Each finding comes from a detector the bank can enable or leave off. Relevance, approval, and channel rules stay shared, so a risk team can drop a plugin without changing the conversation.

| Plugin | What it watches |
| --- | --- |
| Goal deviation | A savings goal drifting off the date the customer chose |
| Cash-flow risk | A bill that would push the balance under their safety level |
| Subscriptions | Recurring spend they are no longer using |
| Liquidity and surplus | Money sitting aside that could fund a goal they already set |
| Energy and restaurant patterns | Spending that has moved away from their own recent history |
| Contextual decision | A purchase they ask about, answered with the cost to their goals |
| Milestones and positive behaviour | Progress worth recognising, measured only against their own history |

---

## The loop

Most banking “insights” fail in one of two ways. They interrupt people with noise, or they hide the reasoning so the customer cannot tell a real signal from a sales push.

The Co-Pilot works the other way:

- It watches **signals** (balances, bills, spending, goals), and it leaves app usage alone.
- It builds a reusable **financial profile** and only then looks for opportunities.
- A **relevance gate** decides whether this is worth the customer’s attention *right now*. Most findings stay quiet on purpose.
- When something does surface, they get a **next best action with trade-offs**.
- **Nothing moves money until they approve it.** Then progress is visible: a goal date shifts, the health reading can be explained, a milestone can be recognised.

Language is the last step. A deterministic engine owns every number, score, forecast, and eligibility decision. A language model, if the bank turns one on, may only rephrase those facts. If the model is missing or fails, the service still runs.

```
Signals → Profile → Opportunity → Relevance → Next best action → Channel → Approval → Progress
```

That loop is what we sell. The screens are how a bank sees it happen inside their own brand.

---

## How it sits in the bank app

Every bank gets the same identity line, in this order:

**bank name · Financial Co-Pilot · on/off · Prototype**

**Prototype** is there for a sales conversation. It switches the skin so you can show the same customer, the same goals, and the same approvals inside another bank. Sophie’s numbers stay. The header, the colour, and the words around her change: accounts, channels, advisor, and disclaimer.

The walkthrough opens on KBC. The chosen bank is kept with her story and returns to KBC when the server restarts.

| Bank | Header | Channels |
| --- | --- | --- |
| KBC | White header, blue wordmark | KBC Mobile, KBC Touch |
| ING | Orange stripe, orange wordmark | ING App, Home'Bank |
| Argenta | Light header, green wordmark | Argenta app, Argenta Internet Banking |
| Belfius | Thin dark line, crimson wordmark | Belfius Mobile, Belfius Direct Net |
| BNP Paribas Fortis | White header, green wordmark | Easy Banking App, Easy Banking Web |

---

## Why a bank wants it

A retail bank already has the data. The hard problem is using it **selectively, explainably, and at the scale of its whole customer book**.

| Principle | What the customer experiences |
| --- | --- |
| Fewer, better interruptions | Unused CineMax+ is bundled into the house-goal recommendation. Predicted insurance stays silent until the invoice is confirmed. |
| Customer in control | Frequency, topics, channels, consent, “forget this”, “never recommend this again”. |
| Explainability | Every card has **Why am I seeing this?** — the observable signals. |
| Responsible progress | Milestones, streaks, and personal bests compare the customer only with their own history. |
| Hybrid AI that can scale | Scoring is deterministic and cheap. An LLM is optional and receives a short fact pack, never the full transaction history. The same engine evaluates events per customer. |
| One conversation, several doors | Urgent risk can arrive on the bank’s messaging channel. Everything else stays in the app. **Show options** continues the same thread. |

The **Intelligence view** is for the bank’s product and risk teams: live decision traces, a relevance-threshold control, and the path from one customer event to a decision about whether to speak.

---

## Walk it with Sophie

**Sophie Peeters**, 34, Ghent. UX researcher. The story is set on **Wednesday 30 September 2026**.

She is the same person in every bank you pick. She is saving for a house, a trip to Japan, and an emergency fund. After a salary rise she has a little unallocated surplus. Her house deposit has drifted about two months behind. An unused cinema subscription is still leaving every month. A €780 home-insurance payment is due Friday. The engine can see it coming, and it waits until the insurer actually asks.

Four moments tell the whole service. Use the **Demo director** (bottom-right) to play them in order. **Reset demo** restores her starting point.

1. **Get the house back on track.** The Co-Pilot offers two changes: cancel unused CineMax+ (€29/month) and redirect typical surplus (€120/month). Together the projected date moves from May 2030 toward September 2029. Her emergency fund is left untouched. She reviews, then **approves**.
2. **Can I afford a €2,000 holiday next month?** Three options, each with the cost in weeks of house-goal delay, plus the signals used to check it.
3. **The invoice arrives while she is away from the app.** Confirmation raises urgency. Messaging is allowed because she opted in and the payment is due within three days. **Show options** continues in the Co-Pilot with the full context.
4. **The next morning, standing orders run.** The emergency fund crosses 75%. That is celebrated **in the app**. Messaging stays quiet, because she was already contacted yesterday.

Presenter notes: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

---

## What opens inside the bank

| Screen | What it is for |
| --- | --- |
| Overview `/` | The morning briefing: health, goals, and only what passed the relevance gate. |
| Co-Pilot `/copilot` | Ask about a purchase, spending, or a goal. Answers come as cards. |
| Goals `/goals` | Journeys, projections, what-if on a single goal. |
| Health `/health` | A financial health reading for this service, shown as five weighted factors. Banks keep their own credit models. |
| Progress `/progress` | Milestones, achievements, responsible streaks, personal bests. |
| Insights `/insights` | The feed, plus what the engine saw and chose to keep quiet. |
| Messaging `/channels` | The bank’s messaging channel and the routing rules. |
| AI controls `/settings` | How, when, and whether the Co-Pilot may speak. |
| Intelligence `/intelligence` | Why a finding surfaced or was held back. For the bank, not for the customer. |

The customer and the chosen bank live in memory while you walk the story. Refreshing a page keeps it. **Reset demo** starts Sophie over.

### Where a bank plugs in

- **Tenant.** Bank name, colours, channels, advisor, disclaimer, and data-use copy.
- **Host switch.** The bank app turns the Co-Pilot on or off. Scoring stays quiet while it is off.
- **Customer.** The service reads the customer id from the bank’s profile.
- **Plugins.** The bank’s enabled detector list is the only set that runs.
- **Core.** Accounts, goals, and transactions sit behind the same service interfaces, so the loop does not depend on one core system.

---

## See it running

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

Copy `.env.example` to `.env.local`. Set `LLM_PROVIDER=openai` and `OPENAI_API_KEY` (any OpenAI-compatible endpoint works). The model receives a **short fact pack** and returns wording. Amounts, scores, and “should we notify?” still come from the engine. Without those variables, a rule-based classifier covers every question in the walkthrough.

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · Recharts · Framer Motion · Zod · Vitest

## Further reading

- [Architecture](docs/ARCHITECTURE.md) — modules, relevance formula, APIs
- [Demo script](docs/DEMO_SCRIPT.md) — eight-minute walkthrough
- [Assumptions](docs/ASSUMPTIONS.md) — the story’s seed data and scoring
- [Production roadmap](docs/PRODUCTION_ROADMAP.md) — event-driven evaluation across a full customer book
