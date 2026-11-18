# Vercel deployment and practical pilot

## Deploy

1. Import this GitHub repository into Vercel. Use Framework Preset **Other**. The included `vercel.json` defines the function, build and routing.
2. Connect a PostgreSQL database from Vercel Storage (Neon is supported). Keep connection variables marked Sensitive. The app accepts `DATABASE_URL` or `POSTGRES_URL`.
3. Redeploy after connecting storage. The build runs idempotent schema creation; production requests do not create tables. `APP_MODE` defaults to `demo`.
4. Open the deployment. Each visitor receives an unguessable, HttpOnly, Secure, SameSite cookie. Database queries scope all records and settings to that visitor's synthetic workspace.

No credentials belong in the repository. Local database files, environment files, Vercel metadata and generated output are ignored. The old Sites deployment remains independent; the Vercel database does not reuse its learner records.

## What addresses the real problem

Use **Learner intake** to register a specific barrier, not a vague risk label. Each case supports a named owner, an explicit next action, due date, case notes, reviewed evidence, and reopening if the problem returns. CSV export lets a program manager review outstanding commitments. Refund timestamps remain preserved and support is optional.

Example: a learner repeatedly misses evening classes because of work shifts. Record that reason, assign Learner Success to agree a realistic replay/practice plan by tomorrow, record the conversation, and verify completed activity or explicit confirmation. A completed ticket is an issue-resolution outcome, not proof that a refund was prevented. Day-30 learning and actual request rates still require observation.

## Protected pilot mode

Use a **separate Vercel project/database** for real operational use. Set `APP_MODE=pilot` and a long random `PILOT_ACCESS_KEY` (20+ characters) through Vercel's sensitive environment settings. The entire app is protected by HTTP Basic authentication. Any username label works; the password is the configured key. If the key is missing or too short, the server fails closed.

Pilot mode begins empty, uses the current clock, and blocks simulated exercises, sample playbook offers and simulated follow-up actions. Enter pseudonymous learner references and useful operational notes. Human-reviewed resolution requires a documented observation, evidence type and explicit reviewer confirmation. This internal operator pilot is not a learner-facing production portal: a shared key provides no individual identity, revocation or role separation. Production requires SSO, individual roles, privacy review and data-lifecycle controls before using sensitive learner information.

The public demo must contain fictional data only. Demo cookies act as workspace access secrets; losing the cookie loses access to that sandbox. An abuse-control and expiration/cleanup job is needed before promoting the public demo broadly; existing demo records are not automatically deleted.

## Tests

`npm ci && npm test` runs 14 tests for original workflows plus intake validation, owner/action/evidence histories, reviewer restrictions, PostgreSQL workspace parameter binding, transaction rollback, and empty pilot initialization with simulation rejection. `node scripts/build-vercel.mjs` checks the deploy build and applies schema only when a database URL is available.

The public application's closed-loop workflow is ready for demonstration. LMS ingestion, external support delivery, individual authenticated learner access, scheduled follow-ups, real refund approval/payment and controlled-experiment measurement remain integrations to implement with Scaler's authorization.
