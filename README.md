# AccountantAI

> AI assistant for accounting firms, backed by the official **ARCA/AFIP** regulations.

AccountantAI is a conversational assistant for accountants that answers tax-related questions **always citing the official regulations**, while keeping a history and per-client context for each client of the firm.

---

## Table of Contents

- [What is it?](#what-is-it)
- [The problem we solve](#the-problem-we-solve)
- [The solution](#the-solution)
- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [How the RAG works](#how-the-rag-works)
- [Keeping the regulations up to date](#keeping-the-regulations-up-to-date)
- [Roadmap](#roadmap)
- [Repository structure](#repository-structure)
- [Running the project](#running-the-project)
- [Specifications (SDD)](#specifications-sdd)
- [Security and privacy](#security-and-privacy)
- [Project status](#project-status)

---

## What is it?

AccountantAI is not a regulation search engine, nor a replacement for the accountant. It is an **assistant for the accountant**: it drafts answers with their legal basis so the professional can verify and send them to their clients, without wasting hours on repetitive queries.

The tool combines:

- A **language model** (Google Gemini 2.5) to draft answers.
- A **corpus of official ARCA/AFIP regulations**, indexed and vectorized.
- A **per-client memory** the AI uses to answer according to each client's particular situation.

## The problem we solve

On any given day, an accountant receives dozens of WhatsApp messages asking the same questions over and over:

> "Can I invoice yet?"
> "When is the monotributo due?"
> "Do I need to recategorize?"
> "How do I issue a credit note?"
> "Which category do I belong to?"

These are quick questions to answer, but:

1. They **interrupt** the professional's deep work.
2. They **repeat** over and over with different clients.
3. They **add no value**: they only confirm what the regulations already say.
4. They **accumulate hours** per week that could be spent interpreting and advising.

Additionally, when the accountant answers, they must be **sure of the legal basis**. Searching for the regulation, corroborating, and citing takes time — and a mistake can cause serious problems for the client.

## The solution

AccountantAI solves this with a **RAG (Retrieval-Augmented Generation) chatbot** over official regulations:

- **Answers with citations.** Every answer that uses regulations shows the source document and its URL so the accountant can verify it before sending.
- **Remembers each client.** The persistent context (tax regime, province, activity) tailors the answer to the client's real case.
- **Stores the full history.** Every query is saved in its client's workspace, so the accountant always knows what was answered and when.

**Philosophy:** the AI removes repetitive work, but **the final decision is always human**. The accountant reviews and decides before sharing any answer.

---

## Features

### MVP (Phase 1)
- **RAG with official regulations** — answers generated from vectorized ARCA/AFIP documents.
- **Regulation citations** — document, type, and source URL in every answer.
- **Per-client workspace** — complete query history per client.
- **Persistent context** — the AI uses the client's profile (monotributo, province, activity) in every answer.
- **Multi-accountant login** — each accountant only sees their own clients (row-level security).
- **Automatic regulation ingestion and updates** — scraping pipeline + nightly sync.

### Phase 2 (out of MVP scope)
- **Semantic search** over history ("what did we reply to Juan about invoicing abroad?").
- **Automatic monthly summary** of each client's queries.
- **Internal notes** that the AI also uses as context.

### Phase 3 (out of MVP scope)
- **WhatsApp integration.**

---

## Architecture

```
┌────────────────────┐        ┌─────────────────────┐        ┌───────────────────┐
│   Frontend          │  HTTP  │   Backend (FastAPI) │  HTTP  │  Google Gemini     │
│   Next.js + Scream  ├───────►│   RAG + API +       ├───────►│  chat + embedding   │
│                     │        │   Ingestion + cron  │        │                    │
└────────────────────┘         └─────────┬───────────┘        └───────────────────┘
                                         │
                           ┌─────────────┴────────────┐
                           ▼                          ▼
                 ┌────────────────────┐    ┌───────────────────────────┐
                 │ Supabase (PostgreSQL│   │ pgvector (HNSW index)     │
                 │  Auth + RLS + data  │    │ over document_chunks      │
                 └────────────────────┘    └───────────────────────────┘
```

Query flow:

1. The accountant types a question in a client's chat.
2. The backend loads the **client context** (persistent profile).
3. The question is converted into a **vector** (embedding).
4. A **semantic search** runs over the vectorized regulation chunks.
5. A **prompt** is built with the context + the relevant chunks.
6. **Gemini 2.5** generates the answer.
7. The backend maps the used chunks → **citations**.
8. The exchange is saved in the conversation history.
9. The frontend renders the answer and the citations as verifiable links.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Frontend architecture | Scream architecture (each page owns its folder) |
| Backend API + RAG | FastAPI (Python) |
| Python tooling | [uv](https://docs.astral.sh/uv/) (env + package manager) |
| Chat model | Google Gemini 2.5 |
| Embeddings | Google `text-embedding-004` (dim 1536) |
| Database + vectors | Supabase (PostgreSQL + `pgvector`) |
| Authentication | Supabase Auth + Row-Level Security |
| Regulation ingestion | Playwright (scraping from a curated URL list) |
| Scheduler | APScheduler / cron (nightly sync) |

## How the RAG works

The regulation corpus is indexed like this:

```
URLs (curated list) → Download → Parse → Clean → Chunk → Embedding → pgvector
```

And queried like this:

```
Question → Embedding → Semantic search (pgvector) → Prompt → Gemini → Answer + Citations
```

Every chunk stores its **attribution** (document + source), so a citation can always trace back to the original text.

## Keeping the regulations up to date

Regulations change. A **nightly job** checks every known source:

- If the content **did not change** (same hash), it is skipped.
- If it **changed**, the source is re-downloaded, re-chunked, and re-embedded.
- If the source **disappears** (404), it is deactivated without deleting the record.

This keeps the knowledge base up to date with minimal cost and effort.

---

## Roadmap

| Phase | Scope |
|-------|-------|
| **Phase 1 — MVP** | RAG + citations · per-client workspace · persistent context · history · multi-accountant · ingestion + cron |
| **Phase 2** | Semantic search over history · monthly summaries · internal notes |
| **Phase 3** | WhatsApp integration |

## Repository structure

```
accountantAI/
├── frontend/            # Next.js (App Router, scream architecture)
│   └── app/             # routes; each page owns its folder
├── backend/             # FastAPI (API, RAG, ingestion, cron)
│   └── app/
│       ├── api/         # REST endpoints
│       ├── rag/         # embedding + retrieval + prompt
│       ├── ingestion/   # scraper + parser + chunker
│       └── scheduler/   # nightly cron
├── load-tests/          # performance tests (k6 + TypeScript), smoke/load
├── supabase/            # SQL migrations (schema, pgvector, RLS)
└── docs/                # specifications (Spec-Driven Development)
```

## Running the project

### Frontend

```bash
cd frontend
pnpm install
cp .env.local.example .env.local   # fill in the Supabase variables
pnpm dev                           # http://localhost:3000
```

### Backend

Requires [uv](https://docs.astral.sh/uv/) (Python package and environment manager).

```bash
cd backend
uv add -r requirements.txt   # first time only: creates pyproject.toml + uv.lock
uv sync                       # first time only: creates .venv and installs deps
cp .env.example .env          # fill in the variables
uv run dev                    # dev server (auto-reload) → http://localhost:8000
```

Useful commands:

```bash
uv run dev        # development server (auto-reload)
uv run start      # production server
uv run python script.py   # run any Python script in the environment
uv add <package>  # add a new dependency (updates pyproject.toml + uv.lock)
```

#### Regulation ingestion (normativa ARCA)

Requires the Playwright Chromium browser (once):

```bash
uv run playwright install chromium
```

Run a one-shot ingestion batch (idempotent — re-running skips unchanged sources):

```bash
uv run ingest                 # full batch
uv run ingest --dry-run       # print the curated seed list only
uv run ingest -v              # verbose logs
```

The curated seed list lives in `backend/app/ingestion/config/seed_urls.yaml` (grouped by topic,
with `index`/`discovery` flags for bounded link discovery from ARCA index pages — see
[`docs/sdd/007-scraper.md`](./docs/sdd/007-scraper.md)). Sources are downloaded with Playwright,
raw files are persisted in the private `normativa` Storage bucket, and chunks are embedded with
`text-embedding-004` (1536 dims) before being upserted into `documents` + `document_chunks`.

Run the tests:

```bash
uv run python -m pytest app/ingestion/tests
```

### Performance testing

Backend performance/smoke tests live in [`load-tests/`](./load-tests/README.md)
(k6 + TypeScript, bundled with esbuild). With the backend running:

```bash
cd load-tests
npm install
npm run smoke        # 1 VU per endpoint — validates access/auth/schema
npm run load         # ramping-VUs load with latency/error thresholds
```

Read `load-tests/.env.example` for the required env vars (e.g. `SUPABASE_JWT_SECRET`
to sign test JWTs). CI typechecks and bundles the suite on every PR.

### Environment variables

**Frontend (`.env.local`):**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Public site URL (SEO/canonical) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Landing page contact email |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client) |

**Backend (`.env`):**

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service key (server/RAG/ingestion) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CORS_ORIGINS` | Allowed origins for calling the API |
| `EMBEDDING_MODEL` | Embedding model (default `text-embedding-004`) |
| `EMBEDDING_DIMENSIONS` | Embedding dimensions (default `1536`) |
| `USER_AGENT` | User-Agent sent to ARCA |
| `INGEST_RATE_LIMIT_DELAY` | Seconds between requests (default `2.0`) |
| `ROBOTS_CHECK_ENABLED` | Respect robots.txt (default `true`) |
| `HEADLESS` | Run Playwright headless (default `true`) |

> **Never** commit real secrets. Service keys live only in the backend.

---

## Specifications (SDD)

This project follows **Spec-Driven Development (SDD)**: every feature has a document that is the source of truth. They live in [`docs/sdd`](./docs/sdd/README.md):

| # | Document | Scope |
|---|----------|-------|
| 0 | README | Index + SDD conventions |
| 1 | [001-architecture](./docs/sdd/001-architecture.md) | Architecture, stack, data flow |
| 2 | [002-login-auth](./docs/sdd/002-login-auth.md) | Login, multi-accountant, RLS |
| 3 | [003-home-dashboard](./docs/sdd/003-home-dashboard.md) | Home and client list |
| 4 | [004-clients](./docs/sdd/004-clients.md) | Workspaces and persistent context |
| 5 | [005-chat-conversation](./docs/sdd/005-chat-conversation.md) | Chat, history, citations |
| 6 | [006-rag-pipeline](./docs/sdd/006-rag-pipeline.md) | RAG pipeline and citations |
| 7 | [007-scraper](./docs/sdd/007-scraper.md) | Regulation ingestion |
| 8 | [008-cron-sync](./docs/sdd/008-cron-sync.md) | Nightly sync |
| 9 | [009-database-schema](./docs/sdd/009-database-schema.md) | Schema, indexes, RLS policies |

## Security and privacy

- **Multi-tenant:** each accountant accesses only their own clients, conversations, and messages through Supabase **Row-Level Security**.
- **Shared read-only corpus:** everyone shares the same regulation corpus, but no one can modify it from the client.
- **Protected keys:** the service key lives only in the backend. The frontend uses the anonymous key + RLS.
- **Client privacy:** each firm's data is isolated from the others.

---

## Project status

- [x] SDD specifications (docs/sdd)
- [x] Frontend scaffold (Next.js + shadcn/ui + pnpm)
- [x] Public landing page with SEO (es-AR) + JSON-LD + sitemap/robots + OG
- [x] Supabase connection layer + `.env` examples
- [x] Backend scaffold (FastAPI + uv) with dependencies installed
- [x] Supabase SQL migrations (schema + pgvector + RLS) — validated against Postgres + pgvector
- [ ] Regulation ingestion (scraper + chunker + embeddings)
- [ ] RAG chat endpoint
- [ ] Client CRUD + chat in the frontend

---

> **Legal notice:** AccountantAI is an assistance tool for professionals. Answers must be verified by an accountant before use, and do not constitute legal or tax advice.