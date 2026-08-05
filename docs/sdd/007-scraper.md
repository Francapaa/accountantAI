# 007 — Normativa Scraper & Ingestion

> Status: Accepted · Last updated: 2026-08-04 · Owner: backend

## Purpose

Populate the vectorized knowledge base with official ARCA/AFIP normativa (monotributo,
invoicing, recategorization, withholdings, etc.) so the RAG can answer with citations.

## Scope

**In scope:**
- Curated source-URL seed list.
- Download (via Playwright for JS-heavy pages) → parse (HTML/PDF) → clean.
- Chunking → embedding → upsert into `documents` + `document_chunks`.
- Failure handling and manual fallback.

**Out of scope:**
- Nightly re-sync (see [008](./008-cron-sync.md)).
- Web open crawl of the entire ARCA site.

## Technical Decisions

| Decision | Choice |
|---|---|
| Source strategy | **Curated URL seed list** (not open crawl) — ARCA is JS-heavy and blocks aggressive crawling |
| Driver | Playwright |
| Parsing | HTML via readability-style extraction; PDF via text extractor |
| Document types | `FAQ, Resolución, Manual, Ley, Instructivo` |
| Chunking | By section/heading with overlap (e.g. 500 tokens, 50 overlap) |
| Idempotency | Upsert by unique `source_url`; recompute `content_hash` |
| Embeddings | Google `text-embedding-004` (`output_dimensionality=1536`) |
| Respect | Rate limiting, user-agent, robots compliance; manual fallback for blocked sections |

## Source-URL Seed List

Curated configuration (initial topics):
1. Monotributo — general + categories + recategorization (FAQ/Manual/Instructivo).
2. Invoicing / facturación (Resolución / Manual).
3. Credit notes / notas de crédito (Instructivo).
4. Recategorization schedules (Instructivo).
5. Reality of current taxes: Ganancias, IVA basics (Ley/Resolución).

> Seeds live in `backend/app/ingestion/config/seed_urls.yaml` (URL, expected `document_type`, `title`).

## Ingestion Pipeline

```
For each seed URL (idempotent):
  1. Download (Playwright) → raw bytes
  2. Compute content_hash (SHA-256 of raw content)
  3. If documents exists for URL and hash unchanged → skip (no re-embed)
  4. Else: parse (HTML→text / PDF→text) → clean
  5. Chunk (by headings, with overlap)
  6. Embed each chunk # if first run, then upsert:
     - documents: title, source_url, document_type, publication_date, content_hash, status
     - delete existing chunks for this document, then insert new chunks (unique doc_id+index)
  7. On 404/gone → mark document is_active = false (tombstone)
```

> Failure handling: per-URL try/catch, log failures with reason, continue the batch. A failed
> URL is left with `status=failed` and retried on the next run.

## Manual Fallback

If a normativa source cannot be scraped (login wall, CAPTCHA, anti-bot), the operator can upload
a PDF via an admin ingestion endpoint. Uploaded files follow the same parse → chunk → embed path,
recording `source_url` as a local/internal marker plus `is_manual=true`.

## Data Model (touched tables)

`documents` and `document_chunks` — full DDL in [009](./009-database-schema.md). Key fields used
here: `source_url` (unique), `content_hash`, `status`, `is_active`, `document_type`,
`publication_date`, `crawled_at`.

## Workflows

**Given** a new seed URL, **when** ingestion runs, **then** the document is downloaded, hashed,
chunked, embedded, and upserted.

**Given** a URL already ingested, **when** ingestion runs again, **then** unchanged hashes are
skipped (no duplicated chunks, no redundant embedding).

**Given** a URL returns 404, **when** ingestion runs, **then** the document is not deleted but
marked `is_active=false`.

**Given** an un-scrapable source, **when** the operator uploads a PDF, **then** it is ingested
with `is_manual=true`.

## Acceptance Criteria

1. Ingestion is idempotent (re-running does not duplicate documents or chunks).
2. Each document is stored once by `source_url` with an accurate `content_hash`.
3. Chunking preserves source attribution (every chunk ties to its document + index).
4. Embedded chunks use the active model and are searchable via pgvector.
5. HTML and PDF sources both produce clean text.
6. Failed/un-scrapable URLs are handled gracefully with a manual fallback.
7. Respects rate limits and robots; does not hammer ARCA.

## Open Questions

- Preferred chunk size/overlap — TBD via evaluation; start 500/50.
- How many seed URLs for MVP launch — TBD; begin with ~5–8 core topics.
- Publication-date extraction accuracy across page layouts — needs validation.

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | Scraper/ingestion spec created with curated seed list + manual fallback. |