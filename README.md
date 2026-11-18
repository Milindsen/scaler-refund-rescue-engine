# Rescue — Scaler Refund Rescue Engine

An independent, working learner-retention prototype for a Program Manager case study. It is not an official Scaler product. All 1,000 identities, signals and outcomes are synthetic.

## Run locally

Requires Node 20+ and Python 3.12+. Run npm ci first to install the PostgreSQL driver. No paid AI API key is required.

```sh
npm run dev
# http://localhost:4173
npm test
npm run build
node scripts/reset.mjs
```

The local server stores records in SQLite under `.local/demo.sqlite`. The first state request seeds 1,000 learners and exactly 150 unique refund requesters. Reset affects only the local demo. Hosted records use Cloudflare D1, provisioned through Sites. Reloads preserve changes.

## What works

* **Command center:** cohort/program filters, live counts, request rates, risk-day chart, reason distribution and priority drill-down.
* **Risk intelligence:** editable rule weights, transparent score components, program-specific deadlines. Scores are illustrative, never calibrated probabilities.
* **Resolution:** seven cause-specific playbooks. Academic and doubt exercises validate answers; catch-up, schedule and access outcomes use explicit simulated evidence. Failed attempts escalate. Sales/policy disputes require a human.
* **Refund operations:** immutable original timestamp; independent acknowledgement; documented, role-restricted state transitions; repeat-request tracking; explicit voluntary continuation; Day-7/30 follow-up dates and simulated activity.
* **Case workspace:** team assignments, previous actions and outcomes, due dates, overdue counts, human-help routing.
* **Learner portal:** six scenario selectors, issue reporting, guidance, responses, escalation and refund submission without mandatory assistance.
* **Pilot and impact:** treatment/control comparisons from current records, editable cost assumptions, proposed request-rate target and validation guardrails.

Every operational action calls the server and saves a learner record. Optimistic revision checks reject stale writes. An atomic database batch updates the learner and appends its audit entry. User-supplied text is escaped in HTML, SQL uses bound parameters, POSTs reject cross-origin browser requests, and settings and state transitions are validated server-side.

## Architecture

```mermaid
flowchart LR
  O[Operator / Finance demo UI] --> API[Worker API]
  L[Learner portal] --> API
  API --> V[Validation + role restrictions]
  V --> R[Deterministic intervention state machine]
  R --> DB[(D1: learners, settings, audit)]
  DB --> D[Dashboard and pilot metrics]
  DEV[Local Node adapter] --> SQ[(Local SQLite)]
```

Pragmatic stack choice: plain JavaScript, a responsive HTML/CSS application, a Cloudflare Worker and D1. This keeps the core portable and deployable without a paid model. The build bundles the three source modules into one Worker. It uses runtime validation, rather than TypeScript; shared types and component extraction are production roadmap items.

## Workflow

```mermaid
flowchart TD
  S[Learning signal / learner report] --> R[Explain risk and confirm cause]
  R --> I[Offer targeted help]
  I --> E{Evidence received?}
  E -->|Useful outcome| V[Verify issue resolution]
  E -->|Failed / sensitive dispute| H[Specialist with prior context]
  V --> F[Day-7 / Day-30 activity follow-up]
  Q[Refund submitted at any time] --> A[Record original timestamp + acknowledge]
  A --> P[Independent refund review and processing]
  A -. Optional .-> I
  V -. Explicit learner choice .-> C[Continuation consent; request retained]
```

## Data model and API

`learners(id, revision, payload)` stores one synthetic learner aggregate with signals, interventions, request history and events. `settings(id, payload)` stores policy-day and score configuration. `audit(id, learner_id, at, action, detail)` stores appended action records. Aggregate JSON simplifies the prototype; production should normalize refund requests, policy versions, intervention attempts and experiment assignments.

`GET /api/state` seeds once and returns the workspace. `POST /api/action` requires id, expected revision, action and data. `POST /api/settings` validates configuration. `X-Demo-Role` selects Operator, Finance or Learner. This is explicitly **not secure production authorization**: anyone with demo access can switch roles and learner identities. The hosted site's owner-only sign-in is the outer access boundary. Do not make this demo public with real data.

## Evidence and assumptions

Reviewed 18 November 2026: [India-facing Scaler terms](https://fp.scaler.com/terms/) and [Scaler's policy explanation](https://www.scaler.com/topics/is-scaler-legit/) describe a 14-day window from the first class, including meet-and-greet. [Other regional terms](https://www.scaler.com/terms/) include different fee language. Applicable signed program terms must govern actual eligibility. The prototype makes no refund eligibility, bank-transfer or financing decisions.

The assignment supplies 1,000 enrolments, 150 unique requesters and a 15% baseline. A 12% target means 120 requesters / 30 fewer requests; it is a hypothesis, never an achieved result. The seed's uniform cause distribution is an assumption, editable in `src/domain.mjs` (`causes` and seed cause selection). Policy windows, risk weights and the target are editable in the UI. The demo clock is fixed at 18 Nov 2026 for repeatable deadlines; action audit timestamps use actual server time.

Day-30 active status in seed records is synthetic future follow-up data, not observed activity from the current November cohort. Deterministic treatment assignment is confounded with cohort and is not a real randomized experiment. No causal lift is claimed.

## Tests

`npm test` checks baseline cardinality, evidence-based academic resolution, failed escalation, refund independence and timestamp preservation, specialist boundaries, Finance transitions, learner-role restrictions, and an API-to-SQLite persistence/audit/concurrency/origin integration flow. CI runs tests, build and Worker syntax verification.

## Deployment

The tracked `.openai/hosting.json` identifies the private Sites project and D1 binding. Sites publishes the pushed source with `dist/server/index.js`, hosting metadata and the SQL migration in `drizzle/`. The provider applies migrations before running the Worker. There are no secrets in this repository.

To use Vercel instead: port `worker.fetch` into a server route, replace the D1 adapter with managed PostgreSQL or an HTTP SQLite provider, apply the schema and provide session-derived authorization. Vercel uses the included api/index.mjs handler and durable PostgreSQL adapter; no records are stored on its ephemeral filesystem.

Public source: https://github.com/Milindsen/scaler-refund-rescue-engine

## Known prototype limits

No LMS, CRM, email, payment or financing integration. No LLM or external AI classification is represented as working. Access checks, case assignments, attendance, workload agreements and retention evidence are simulations. There is no scheduler sending follow-up messages. Support-time, complaint and cost telemetry are not collected; the analytics panel labels these as future guardrails. Global settings edits do not yet have policy-version history. Seeding retries missing IDs if interrupted; hosted migration and reset operations still need an administrative lifecycle before multi-user production. No offline mode or real user authentication. No automated browser test runner is bundled; manual browser verification is recorded separately.

## Production roadmap

1. Replace demo identities and role headers with SSO, tenant boundaries and enrolment-level authorization; normalize records and snapshot approved policy versions.
2. Integrate LMS attendance/practice and CRM support events with idempotent ingestion, consent, data minimization and retention controls.
3. Add verified playbook content, SLA queues, notifications and scheduled follow-ups; instrument complaints, resolution time and handling costs.
4. Run a concurrent randomized pilot within program/cohort strata. Pre-register request-rate and Day-30 outcomes, use intention-to-treat analysis and confidence intervals, and monitor refund delays and negative feedback.
5. Add monitoring, rate limits, backup/restore testing, accessibility audit, load tests and security review before real learner use.

## Three-minute presentation

**0:00–0:30:** Open Command center. Explain the assignment baseline and the hypothetical 12% target. Emphasize that the data is synthetic and the product connects signals to useful support.

**0:30–1:25:** Click “Resolve a refund risk.” Inspect Aarav's signals. Offer the academic intervention, open the learner experience, enter `16`, and verify. Return to the dashboard to show the saved resolution and lower current risk. Explain that this proves workflow functionality, not a prevented refund.

**1:25–2:10:** Select Vikram in the learner portal. Show the existing request and that help is optional. Select Meera; record voluntary continuation. The original request remains visible. Switch to Finance to move an acknowledged request to Under review with a note.

**2:10–2:35:** Open Ananya's expectations mismatch. Route it to Sales, preserving the handoff discrepancy and intervention history. Avoid automated promises.

**2:35–3:00:** Open Pilot & impact. Explain concurrent randomization, Day-30 activity and complaint guardrails. Close with the mechanism: identify friction sooner, resolve specific problems, escalate with context, and measure sustained learning without obstructing refunds.
