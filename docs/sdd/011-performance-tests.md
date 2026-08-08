# 011 — Performance Testing (k6 + TypeScript)

## Purpose

Deliver a repeatable, CI-validated performance testing practice for the
AccountantAI backend so that every public and authenticated HTTP endpoint has:

1. a **smoke** script that proves connectivity, authentication and schema
   compliance in seconds;
2. a **load** script that runs a configurable ramping-VUs profile and asserts
   latency distribution and error-rate thresholds.

This spec covers *how we test* and *what we measure*, not the expected
performance numbers (those belong in release runbooks and environment
dashboards).

## Scope

### In scope

- Performance testing toolchain: **k6** (CLI) + **TypeScript**, authored under
  `load-tests/`, bundled to CommonJS with esbuild.
- Coverage of the backend HTTP surface: public endpoints (`/`, `/health`),
  JWT-protected endpoints (`/api/me`, `/api/whatsapp/*`), and the Meta webhook
  endpoints (GET verify + POST HMAC) — see the matrix below.
- Local execution (`k6 run`) plus CI jobs that install, strict-typecheck and
  bundle every script so the suite never rots.
- Test-only auth: the runtime signs an HS256 JWT on the fly, removing any
  dependency on a login service for load runs.

### Out of scope

- Running load tests against deployed environments (needs URL/credentials).
  Scripts are env-parameterized (`BASE_URL`) so that is a runbook step, not
  part of this spec.
- Stress/soak/spike profiles by default: `load()` ships a `ramping-vus`
  preset; additional presets can be added later in `src/lib/scenarios.ts`.
- Performance of the frontend, ingestion pipeline, or external services
  (Meta).
- **Load-testing write endpoints** (`POST`/`DELETE connections`, `POST drafts`,
  `POST drafts/{id}/approve`): they mutate the database or call WhatsApp, so
  they are smoke-tested by design (see Technical Decisions).

## Technical Decisions

- **k6 as the load runner.** Single binary, battle-tested HTTP/1.1 and
  HTTP/2, scripting in JS/TS with the `k6/*` standard modules.
- **TypeScript → CJS via esbuild.** k6 cannot run TypeScript natively.
  `load-tests/build.mjs` resolves `src/**/*.test.ts` and bundles each one to a
  standalone CJS file in `dist/`. `npm run typecheck` runs strict TypeScript
  (`@types/k6`) and is enforced in CI.
- **Configuration only through `__ENV`.** Every tunable is read from k6 env
  vars documented in `load-tests/.env.example`; nothing is hard-coded and no
  secret is committed.
- **JWT-on-the-fly.** Protected routes require a Supabase JWT (HS256,
  audience `authenticated`, claims `sub` + `exp`, verified by PyJWT in
  `backend/app/api/auth.py`). `src/lib/jwt.ts` signs the token inside the test
  using `SUPABASE_JWT_SECRET` + `SUB_USER_ID`, so:
  - no login endpoint is hit to acquire tokens;
  - tokens are minted per run, so a load run never dies from an expired token;
  - the same secret used by the backend keeps the verification identical to
    production.
- **Write endpoints are smoke-only.** They have real side effects:
  `POST connections`/`drafts` insert rows; `approve` fires a real WhatsApp
  message via Meta. Load testing them would pollute data or incur real cost.
  Therefore:
  - `connections` smoke runs the CRUD lifecycle (GET → POST → DELETE);
  - `drafts` smoke requires an anchor `CONVERSATION_ID` (falls back to a
    tolerated 404 when the fixture is absent);
  - `approve` smoke is opt-in, named `*.opt.smoke.test.ts`, excluded from
    directory-wide smoke runs, and aborted unless `APPROVE_DRAFT_ID` is set.
- **Webhook load is write-free.** The Meta webhook persists inbound messages;
  the load test POSTs a "heartbeat" payload (valid HMAC, no `messages[]`),
  exercising signature verification + JSON parsing + empty-ingest without
  writing a single row.
- **Env-parameterized load profile.** `load()` reads
  `_START_VUS / _PEAK_VUS / _STAGE_S / _HOLD_S`, so one script covers both
  CI-safe low-volume runs and light-load phases.

## Data Model

No schema changes. Load smoke scripts may read existing tables
(`whatsapp_connections`, `messages`, `conversations`, `clients`) when fixture
ids are provided via env; the fixture rows must be owned by `SUB_USER_ID`.

## API coverage matrix

Validated against `backend/app/main.py`:

| Endpoint                                  | Method | Auth   | Smoke | Load      |
|-------------------------------------------|--------|--------|-------|-----------|
| `/`                                       | GET    | public | yes   | —         |
| `/health`                                 | GET    | public | yes   | yes       |
| `/api/me`                                 | GET    | JWT    | yes   | yes       |
| `/api/whatsapp/connections`               | GET    | JWT    | yes   | yes       |
| `/api/whatsapp/connections`               | POST   | JWT    | yes   | —*        |
| `/api/whatsapp/connections/{id}`         | DELETE | JWT    | yes   | —*        |
| `/api/whatsapp/drafts`                    | POST   | JWT    | yes   | —*        |
| `/api/whatsapp/drafts/{id}/approve`       | POST   | JWT    | opt-in| —*        |
| `/api/whatsapp/webhook`                   | GET    | verify-token | yes | yes |
| `/api/whatsapp/webhook`                 | POST   | HMAC    | yes   | yes (heartbeat) |

`*` write endpoints are smoke-only by design — see Technical Decisions.

## Workflows (given / when / then)

**Token bootstrap**
- *Given* `SUPABASE_JWT_SECRET` is set in the environment and matches
  `backend/.env`,
- *when* any protected script runs,
- *then* an HS256 JWT can be built and `Authorization: Bearer <token>` is
  accepted by `backend/app/api/auth.py` (expected `200`, never `401`.

**Smoke**
- *Given* a live backend on `BASE_URL`,
- *when* `npm run smoke` runs every `dist/smoke/*.test.js`,
- *then* each endpoint responds with its expected status and the suite exits
  `0`; genuine 401/404 from missing fixtures do not go to the threshold.

**Load**
- *Given* a live backend and env vars,
- *when* `npm run load:me --  --env LOAD_PEAK_VUS=20` runs,
- *then* VUs ramp `0 → start → peak → hold → 0` and thresholds are enforced
  (`http_req_failed rate < 1%`, `p(95) < 500ms`, `p(99) < 1000ms`,
  `max < 2000ms`); a breach fails the run with non-zero exit code.

**Approve (opt-in)**
- *given `APPROVE_DRAFT_ID` points to an owned draft,
- *when* `npm run smoke:approve` runs,
- *then* a real WhatsApp send fires and the draft flips to `sent`; without the
  env var the test aborts instead of spending money.

## Acceptance Criteria

- [ ] `k6 version` succeeds on a fresh machine (winget/choco/brew/apt).
- [ ] `npm run typecheck` — strict TypeScript across `src/` (CI-enforced).
- [ ] `npm run build` emits one CJS bundle per `*.test.ts` under `dist/`.
- [ ] Smoke suite covers every endpoint listed in the API matrix.
- [ ] A smoke run against a live backend exits `0` when the documented env
      vars (`.env.example`) are populated; absent fixtures degrade to explicit
      `401/404` checks that are documented, never silent.
- [ ] Load scripts react to `LOAD_*` env vars and exit non-zero when any
      threshold is breached.
- [ ] CI never runs `k6` (no network target) but always typechecks + builds, so
      a broken test build fails the pipeline.
- [ ] No secret value is ever committed; `.env*` are gitignored.

## Open Questions

- Should write-endpoint load specifically run in a sandbox with automated
  cleanup? (Requires a staging Supabase and a dedicated Meta account.)
- Do we want soak/spike presets as first-class in `scenarios.ts`?
- Should the test suite be invoked in a load-after-deploy CI gate?

## Changelog

### 2026-08-08 — Initial draft

- Specify k6 + TypeScript (esbuild) toolchain and the `load-tests/` layout.
- Define the smoke/load model, on-the-fly JWT auth, write-safety rules and the
  API coverage matrix.
- Add a CI job that installs, typechecks and builds the suite.