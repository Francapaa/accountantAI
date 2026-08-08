# AccountantAI — Performance tests (k6 + TypeScript)

[k6](https://k6.io) load and smoke tests for the backend **REST endpoints**
(FastAPI, `backend/`). Scripts are written in TypeScript, bundled to a single
k6-compatible CJS file with [esbuild](https://esbuild.github.io), and executed
by the `k6` CLI.

## Requirements

- [k6](https://k6.io/docs/getting-started/installation/) `>= 0.49`
- Node.js `>= 20` (for the build tooling only).

```powershell
# Windows
winget install GrafanaLabs.k6

# macOS (Homebrew)
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642FC53A3A0B38B5BFEB469
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

Verify: `k6 version`.

## Install & build

```bash
cd load-tests
npm install
npm run typecheck   # TypeScript strict — CI-enforced
npm run build       # bundles src/**/*.test.ts -> dist/
```

`npm run smoke` and `npm run load` build first, so you can just run them.

## Endpoints covered

| Test file                                | Endpoint(s)                                        |
|------------------------------------------|----------------------------------------------------|
| `smoke/health.smoke.test.ts`             | `GET /`, `GET /health`                             |
| `smoke/me.smoke.test.ts`                 | `GET /api/me` (JWT)                                |
| `smoke/connections.smoke.test.ts`        | `GET/POST/DELETE /api/whatsapp/connections` (JWT)  |
| `smoke/drafts.smoke.test.ts`             | `POST /api/whatsapp/drafts` (JWT)                  |
| `smoke/approve.opt.smoke.test.ts` (opt-in) | `POST /api/whatsapp/drafts/{id}/approve` (sends)  |
| `smoke/webhook.smoke.test.ts`            | `GET/POST /api/whatsapp/webhook` (Meta auth)       |
| `load/health.load.test.ts`               | `GET /health`                                      |
| `load/me.load.test.ts`                   | `GET /api/me` (JWT)                                |
| `load/connections.load.test.ts`          | `GET /api/whatsapp/connections` (JWT, read-only)   |
| `load/webhook.load.test.ts`              | `GET verify + POST heartbeat` (write-free)         |

## Running the tests

**One-time setup:** start the backend (`cd backend && uv run dev` →
`http://127.0.0.1:8000`) and fill in `load-tests/.env` with your values
(`cp .env.example .env` if you don't have it yet). `run.mjs` loads `.env`
automatically when you run any npm script, so **no flags are needed**.

```bash
# Smoke (single VU, few iterations, validates auth + schema) — all endpoints:
npm run smoke

# Smoke per endpoint:
npm run smoke:health
npm run smoke:me
npm run smoke:connections
npm run smoke:drafts
npm run smoke:webhook

# Approve is OPT-IN because it really sends a WhatsApp message through Meta.
npm run smoke:approve -- --env APPROVE_DRAFT_ID=<id> ...

# Load (ramping VUs, profile read from LOAD_* in .env):
npm run load
```

CLI `--env` flags still win over `.env`, so you can override per run:

```bash
npm run smoke -- --env BASE_URL=http://other-host:8000
```

### Environment variables (`--env NAME=value`)

| Variable               | Purpose                                              | Default                       |
|------------------------|------------------------------------------------------|-------------------------------|
| `BASE_URL`             | Backend origin                                        | `http://127.0.0.1:8000`               |
| `SUPABASE_JWT_SECRET`  | JWT signing secret (signs inside k6, no login)        | — (protected endpoints -> 401) |
| `SUB_USER_ID`          | `sub` claim; must own fixture rows for write tests    | uuid-1 placeholder             |
| `CONVERSATION_ID`      | Anchor conversation for `drafts` happy path          | — (drafts -> 404 tolerated)    |
| `CONNECTION_ID`        | Anchor connection id for re-used flows               | —                              |
| `APPROVE_DRAFT_ID`     | Draft id to approve (opt-in, real Meta send)         | — (aborts the approve test)    |
| `WHATSAPP_VERIFY_TOKEN`| Webhook `hub.verify_token` (GET)                     | — (403 if empty)               |
| `WHATSAPP_APP_SECRET`  | Webhook HMAC secret for `X-Hub-Signature-256`  | — (401 if empty)               |
| `LOAD_START_VUS` `LOAD_PEAK_VUS` `LOAD_STAGE_S` | Ramping‑VUs profile | |

### Auth how it works

Protected endpoints require a Supabase JWT. Instead of logging in, the tests
sign an HS256 JWT **inside the k6 runtime** (`src/lib/jwt.ts`) using
`SUPABASE_JWT_SECRET` + `SUB_USER_ID`, so load runs never depend on a login
service. The backend verifies it exactly as it does for real sessions
(`backend/app/api/auth.py`).

## Test design notes

- **Smoke**: `shared-iterations`, 1 VU. Validates authentication, schema
  compliance and happy-path status codes per endpoint.
- **Load**: `ramping-vus` (`0 -> start -> peak -> hold -> 0`). Thresholds
  default to `http_req_failed rate < 1%`, `p(95) < 500ms`, `p(99) < 1000ms`.
- **Write endpoints are only smoke-tested.** `POST connections` / `POST drafts`
  insert rows, and `approve` fires a real Meta message; hammering them in a
  load run would pollute the DB. If you need write load, point them at a
  dedicated sandbox and add explicit cleanup.
- **Webhook load uses a "heartbeat" payload** (no `messages[]`) to excercise the
  full verify + parse path without persisting rows.

## Layout

```
load-tests/
├── build.mjs            # esbuild bundler (src/**/*.test.ts → dist/ CJS)
├── run.mjs              # runs one file or an entire subdirectory against k6
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── lib/             # jwt, config, scenarios, http, fixtures
    ├── smoke/           # per-endpoint one-shot validations
    └── load/            # ramping-VUs performance suites
```