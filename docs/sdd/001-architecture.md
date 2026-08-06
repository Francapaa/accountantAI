# 001 — System Architecture

> Status: Accepted · Last updated: 2026-08-04

## Purpose

Define the overall system architecture, technology stack, end-to-end data flow, and the
versioning strategy for the RAG knowledge base. This document is the entry point for how the
pieces (frontend, backend, Supabase, Gemini) fit together.

## Scope

**In scope:**
- Layer breakdown (frontend, backend, data, ingestion).
- End-to-end request flow for a chat query.
- End-to-end flow for normativa ingestion.
- Embedding model versioning.

**Out of scope:**
- Phase 2 features (semantic search over history, summaries, internal notes) — see README roadmap.
- WhatsApp integration (Phase 3).
- Detailed schema DDL (see [009-database-schema](./009-database-schema.md)).
- Detailed RAG prompt design (see [006-rag-pipeline](./006-rag-pipeline.md)).

## Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Frontend | **Next.js (App Router) + TypeScript + Tailwind** | Full-stack-ready, SSR, mature ecosystem. |
| Frontend architecture | **Scream architecture** (see [skill: frontend-scream]) | Each page owns its folder (page.tsx, actions.ts, components/); shared code in `lib/`. |
| Backend API + RAG | **FastAPI (Python)** | Mature Python RAG/embedding ecosystem, official Google SDK. |
| Database + Vectors | **Supabase (PostgreSQL + pgvector)** | One provider for Postgres, vectors, built-in Auth, and RLS. |
| Chat model | **Google Gemini 2.5** | Chosen by product for answer quality. |
| Embedding model | **Google `gemini-embedding-2`** (call with `output_dimensionality=1536`) | Separate from chat model; configured dimension **1536** to stay under pgvector's 2000-dim index limit. |
| Auth | **Supabase Auth** | Multi-accountant, integrated Row-Level Security. |
| Ingestion | **Playwright scraper from curated URL seed list** | Open crawl of ARCA is too heavy and blocked; curated seeds are robust. |
| Scheduling | **Nightly cron on backend (APScheduler / external scheduler)** | See [008-cron-sync](./008-cron-sync.md). |
| WhatsApp transport | **Meta Cloud API direct + `IWhatsAppProvider` abstraction** | Swappable provider; free-form replies within 24h are free. See [010](./010-whatsapp-adapter.md). Provides a `backend/app/whatsapp/` module. |

> **Embedding dimension is fixed.** The `pgvector` column dimension (1536) MUST match the
> embedding model output (`output_dimensionality=1536`). pgvector indexes support at most
> 2000 dimensions, so 1536 keeps the HNSW index valid. Changing the model requires a data
> migration (re-embed) — versioned per chunk.

## Logical Architecture

```
┌────────────────────┐        ┌─────────────────────┐        ┌───────────────────┐
│   Frontend          │  HTTP  │   Backend (FastAPI) │  HTTP  │  Google Gemini     │
│   Next.js + Scream  ├───────►│   API + RAG +       ├───────►│  chat + embed      │
│                     │        │   Ingestion         │        │                    │
└────────────────────┘         └─────────┬───────────┘        └───────────────────┘
                                         │
                           ┌─────────────┴────────────┐
                           ▼                          ▼
                 ┌────────────────────┐    ┌──────────────────────┐
                 │ Supabase (PostgreSQL│   │ pgvector (HNSW index) │
                 │  Auth + RLS + data  │    │ on document_chunks    │
                 └────────────────────┘    └──────────────────────┘
```

Two separate applications:
- `frontend/` — Next.js UI.
- `backend/` — FastAPI API, RAG pipeline, scraper, and cron.

Shared infrastructure: a single Supabase project.

## Repository Layout

```
accountantAI/
├── frontend/            # Next.js (scream architecture)
│   └── app/             # routes; each page owns a folder
├── backend/             # FastAPI
│   └── app/
│       ├── api/         # REST endpoints
│       ├── rag/         # embedding + retrieval + prompt
│       ├── ingestion/   # scraper + storage(bucket) + parser + chunker + embedder
│       ├── whatsapp/    # WhatsApp provider abstraction (Meta Cloud API) — see 010
│       └── scheduler/   # nightly cron
├── supabase/            # SQL migrations (schema + indexes + RLS policies)
└── docs/sdd/            # these specs
```

## End-to-End Flow: Assistant Query

```
1. Frontend page calls backend POST /api/chat (client_id + message)
2. Backend loads client persistent profile (context)
3. Backend embeds the query (gemini-embedding-2)
4. Backend runs semantic search over document_chunks (pgvector)
5. Backend builds prompt: client context + retrieved chunks (source of truth)
6. Backend calls Gemini 2.5 to produce the answer
7. Backend maps used chunks → citations (document title + source_url)
8. Backend persists the exchange in messages (with citations JSON)
9. Frontend renders the answer and clickable citations
```

Detailed behavior in [006-rag-pipeline](./006-rag-pipeline.md) and [005-chat-conversation](./005-chat-conversation.md).

## End-to-End Flow: Normativa Ingestion

```
1. Curated URL seed list (config)
2. Crawl/Download raw content (Playwright)
3. Upload raw file (PDF/HTML) to the private `normativa` Storage bucket → storage_path
4. Parse the stored HTML/PDF → text
5. Clean (strip boilerplate, normalize whitespace)
6. Chunk with overlap (by section / heading)
7. Embed each chunk (gemini-embedding-2)
8. Upsert into documents + document_chunks (pgvector)
```

Detailed behavior in [007-scraper](./007-scraper.md).

## Embedding Model Versioning

- Every `document_chunk` row stores `embedding_model` (e.g. `gemini-embedding-2`).
- If the embedding model changes:
  1. Update the version constant.
  2. Re-run ingestion for all documents (or a migration script) to re-embed.
  3. Confirm the pgvector column dimension matches the new model output.
- Chunks whose `embedding_model` differs from the active version are treated as stale (not
  returned by retrieval until re-embedded).

## Acceptance Criteria

1. The two applications are separated (frontend/ and backend/) and each runs independently.
2. A chat query produces an answer with at least one citation to a source document.
3. Ingestion populates the vector store in a repeatable (idempotent) way.
4. Embedding dimension and model version are consistent and versioned per chunk.
5. Architecture doc is referenced by all feature specs and stays in sync with code.

## Open Questions

- Will the MVP run embeddings in batch (background ingestion) vs inline? → Batch in cron; see [007](./007-scraper.md) and [008](./008-cron-sync.md).
- Deployment target for backend scheduler (VM vs serverless) — TBD pending hosting decision.

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | Initial architecture accepted: Next.js + FastAPI + Supabase (pgvector) + Gemini. |
| 2026-08-05 | Embedding dimension fixed to 1536 (`output_dimensionality=1536`) to stay under the pgvector 2000-dim index limit. |
| 2026-08-05 | Raw normativa sources (PDF/HTML) are persisted in a private Supabase Storage bucket (`normativa`) before chunking; ingestion flow and repo layout updated. |