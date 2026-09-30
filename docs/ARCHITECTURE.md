# Architecture

The Co-Pilot is a **deterministic intelligence engine** with an optional language layer on top. Scoring, eligibility, forecasts and actions never depend on an LLM.

```
Signals → Profile → Detectors → Relevance → Next best action → Channel → Approval → Progress
```

## Runtime

- Next.js 15 App Router. UI is client-side; `/api/*` routes read and mutate one in-memory customer.
- `src/lib/services/store.ts` keeps Sophie on `globalThis` so hot reloads keep demo state. `reset` restores `createSeedState()`.
- Mock services (`customer`, `transaction`, `goal`) are the only write path. Production would swap these for KBC backends.

## Intelligence

| Module | Role |
| --- | --- |
| `engine/signals.ts` | Monthly spend, surplus, unused subscriptions, cashflow forecast |
| `engine/profile.ts` | Essentials, emergency months, behaviour changes |
| `engine/healthScore.ts` | Weighted demo metric (buffer 40%, goals 25%, stability 15%, savings 10%, debt 10%) |
| `engine/momentum.ts` | Improving / Steady / Slowing from score trend and on-track share |
| `engine/goals.ts` | Linear projections, required monthly, what-if impact |
| `engine/milestones.ts` | Reached vs acknowledged milestones, streaks, achievements |
| `engine/detectors/*` | Pluggable opportunity types |
| `engine/relevance.ts` | `0.35·impact + 0.25·urgency + 0.25·goalRelevance + 0.15·confidence` |
| `engine/nba.ts` | Reviewable actions with trade-offs |
| `engine/channels.ts` | App by default; WhatsApp only for urgent risk or high-priority milestones |
| `engine/simulate.ts` | Affordability and monthly what-if |

**Anti-spam:** frequency penalty (8% per notification in 7 days, cap 30%, skipped when urgency ≥ 80) applies only to `messagingScore`. In-app surfacing uses the unpenalised score. Bundling, consent, never-recommend, 14-day dismiss cool-off and topic flags all suppress before the customer is interrupted.

## AI layer

- `classifyIntent` covers the demo questions without a network call.
- `draftAnswer` always fills structured `ChatBlock`s from engine output.
- `OpenAICompatibleAdapter` rephrases the draft with a 8s timeout and a minimal fact pack. On any failure, the deterministic text is shown.
- Guardrails: no product pushing, no credit/investment advice, advisor hand-off for regulated topics, numbers come only from the engine.

## APIs

`/api/profile` (snapshot), `/api/chat`, `/api/actions`, `/api/simulate`, `/api/events`, `/api/preferences`, `/api/memory`, `/api/recommendations/.../feedback`, `/api/intelligence?threshold=`.

## Event model (demo vs production)

Demo events (`insurance_invoice`, `standing_orders`) mutate Sophie then re-score. Production would subscribe detectors to transaction/invoice/salary events per customer and evaluate only the affected rules. See [PRODUCTION_ROADMAP.md](PRODUCTION_ROADMAP.md).
