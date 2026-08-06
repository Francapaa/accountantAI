# 007 — Normativa Scraper & Ingestion

> Status: Accepted · Last updated: 2026-08-04 · Owner: backend

## Purpose

Populate the vectorized knowledge base with official ARCA/AFIP normativa (monotributo,
invoicing, recategorization, withholdings, etc.) so the RAG can answer with citations.

## Scope

**In scope:**
- Curated source-URL seed list.
- **Bounded link discovery** from curated index pages (see below) to auto-amplify the seed list.
- Download (via Playwright for JS-heavy pages).
- **Persist every raw source (PDF/HTML) in a private Supabase Storage bucket** — single source of
  truth for the raw files.
- Parse (HTML/PDF) → clean.
- Chunking → embedding → upsert into `documents` + `document_chunks`.
- Failure handling and manual fallback.

**Out of scope:**
- Nightly re-sync (see [008](./008-cron-sync.md)).
- Web open crawl of the entire ARCA site.

## Technical Decisions

| Decision | Choice |
|---|---|
| Source strategy | **Curated URL seed list** (not open crawl) — ARCA is JS-heavy and blocks aggressive crawling |
| Discovery | **Bounded link extraction from curated index pages** — follows only allowlisted links (biblioteca `/dcp/*`, ARCA `/ayuda/*`), depth 1, per topic |
| Driver | Playwright |
| Raw-file storage | **Private Supabase Storage bucket** (`normativa`) — every source uploaded as an object (`.pdf` or `.html`); bucket is private, accessed only by the backend service role |
| Parsing | HTML via readability-style extraction; PDF via `pypdf` text extractor |
| Document types | `FAQ, Resolución, Manual, Ley, Instructivo` |
| Chunking | By section/heading with overlap (e.g. 500 tokens, 50 overlap) |
| Idempotency | Upsert by unique `source_url`; recompute `content_hash` |
| Embeddings | Google `gemini-embedding-2` (`output_dimensionality=1536`) |
| Respect | Rate limiting, user-agent, robots compliance; manual fallback for blocked sections |

## Source-URL Seed List

Curated configuration (initial topics):
1. Monotributo — general + categories + recategorization (FAQ/Manual/Instructivo).
2. Invoicing / facturación (Resolución / Manual).
3. IVA — Libro de IVA Digital (Instructivo / Resolución).
4. Ganancias — basics (Ley / Manual).
5. Reality of current taxes: Ganancias, IVA basics (Ley/Resolución).

> Seeds live in `backend/app/ingestion/config/seed_urls.yaml`. The file is grouped by **topic**
> (`topics[].name`), and each seed carries `url`, `document_type`, `title`, plus two flags:
> - `index: true` → this page is an **index** (e.g. `.../ayuda/normativa.asp`) that lists other
>   norms; it is the source for bounded discovery.
> - `discovery: true` → ingestion extracts allowlisted links from this page and ingests them as
>   new candidate seeds (see [Bounded Link Discovery](#bounded-link-discovery)).

## Bounded Link Discovery

The curated seeds include **index pages** (ARCA `.../ayuda/normativa.asp`) for every topic
(monotributo, facturación, IVA, ganancias, bienes personales, régimen general, casas particulares,
inscripción, viajeros, clave fiscal) that list the whole normativa of the topic (Resoluciones
Generales, Leyes, Decretos) as links to the Electrónica Library. Ingestion uses them to amplify
the seed list **without** open-crawling the site:

```
For each seed with discovery=true:
  1. Parse the index page and collect outbound links.
  2. Keep only links matching the allowlist:
     - biblioteca.{afip,arca}.gob.ar/dcp/*                          → Ley / Decreto / Resolución
     - biblioteca.{afip,arca}.gob.ar/search/query/norma.aspx?p=...  → recent norms (2024+)
     - biblioteca.{afip,arca}.gob.ar/search/query/dcp/*             → legacy slug links
     - arca.gob.ar/.../ayuda/*                                      → Manual / Instructivo / FAQ
  3. Depth 1 only: links found on index pages are ingested; their own links are NOT followed.
  4. Dedupe by source_url against documents table; infer document_type from URL
     (e.g. /dcp/REAG0* or p=t:RAG → Resolución, LEY_C_* or p=t:LEY → Ley, DEC_C_* → Decreto)
     and title from link text.
  5. Each discovered URL is ingested through the normal pipeline (download → bucket → parse → chunk → embed).
```

> ARCA links recent resolutions (2024–2025) with `search/query/norma.aspx?p=t:RAG|...` URLs. These
> render the full norm text just like `/dcp/*` pages, so they are allowlisted too. Norms cited in
> multiple topic indexes are deduped by `source_url`.

Rules that keep discovery bounded:
- Only pages explicitly flagged `discovery: true` are traversed.
- Only allowlisted domains/paths are followed.
- Maximum depth is 1 (no recursive crawl).
- Rate limiting / robots respect apply exactly as for any seed.

## Ingestion Pipeline

```
Resolve seed list:
  a. Load curated seeds from seed_urls.yaml.
  b. For each seed with discovery=true: extract allowlisted links → new candidate URLs (dedupe by source_url).
     Discovered URLs are treated as seeds with inferred document_type/title.
For each seed URL (idempotent):
  1. Download (Playwright) → raw_bytes + content_type (PDF or HTML)
  2. Compute content_hash (SHA-256 of raw content)
  3. If documents exists for URL and hash unchanged → skip (no re-upload, no re-embed)
  4. Else: upload raw_bytes to the `normativa` bucket → storage_path
  5. Parse (HTML→text / PDF→text) from the stored object → clean
  6. Chunk (by headings, with overlap)
  7. Embed each chunk # if first run, then upsert:
     - documents: title, source_url, storage_path, document_type, publication_date,
       content_hash, status
     - delete existing chunks for this document, then insert new chunks (unique doc_id+index)
  8. On 404/gone → mark document is_active = false (tombstone)
```

Raw files are uploaded **before** parsing so the private bucket is the durable origin of every
normativa source. Chunking reads from the stored object, keeping the raw corpus and its vectorized
form consistent and reproducible.

> Failure handling: per-URL try/catch, log failures with reason, continue the batch. A failed
> URL is left with `status=failed` and retried on the next run.

## Manual Fallback

If a normativa source cannot be scraped (login wall, CAPTCHA, anti-bot), the operator can upload
a PDF via an admin ingestion endpoint. Uploaded files follow the same **upload-to-bucket → parse →
chunk → embed** path, recording `source_url` as a local/internal marker plus `is_manual=true`.

## Data Model (touched tables)

`documents` and `document_chunks` — full DDL in [009](./009-database-schema.md). Key fields used
here: `source_url` (unique), `storage_path` (object in the `normativa` bucket), `content_hash`,
`status`, `is_active`, `document_type`, `publication_date`, `crawled_at`.

## Workflows

**Given** a new seed URL, **when** ingestion runs, **then** the document is downloaded, hashed,
uploaded to the `normativa` bucket, chunked, embedded, and upserted.

**Given** a URL already ingested, **when** ingestion runs again, **then** unchanged hashes are
skipped (no duplicated chunks, no redundant embedding).

**Given** a URL returns 404, **when** ingestion runs, **then** the document is not deleted but
marked `is_active=false`.

**Given** an un-scrapable source, **when** the operator uploads a PDF, **then** it is ingested
with `is_manual=true`.

**Given** an index page with `discovery: true`, **when** ingestion runs, **then** its allowlisted
links are extracted, deduped, and ingested as candidate seeds (depth 1, no recursive crawl).

## Acceptance Criteria

1. Ingestion is idempotent (re-running does not duplicate documents or chunks).
2. Each document is stored once by `source_url` with an accurate `content_hash`.
3. **Every raw source (PDF/HTML) is persisted as an object in the private `normativa` bucket and
   referenced by `documents.storage_path`.**
4. Chunking preserves source attribution (every chunk ties to its document + index).
5. Embedded chunks use the active model and are searchable via pgvector.
6. HTML and PDF sources both produce clean text.
7. Failed/un-scrapable URLs are handled gracefully with a manual fallback.
8. Respects rate limits and robots; does not hammer ARCA.
9. Discovery only follows allowlisted links at depth 1 from `discovery: true` index pages; it never
   recursively crawls the site.

## Open Questions

- Preferred chunk size/overlap — TBD via evaluation; start 500/50.
- How many seed URLs for MVP launch — TBD; begin with ~5–8 core topics.
- Publication-date extraction accuracy across page layouts — needs validation.
- The `document_type` enum lacks `Decreto` (index `DEC_C_*`). Discovered Decretos are currently
  classified as `Ley` pending an enum decision (see [009](./009-database-schema.md)).
- Facturación RG slugs (e.g. RG 5866/2026) pending validation via the Electrónica Library search.

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | Scraper/ingestion spec created with curated seed list + manual fallback. |
| 2026-08-05 | Raw sources (PDF/HTML) are now persisted in a private Supabase Storage bucket (`normativa`) before parsing/chunking; added `documents.storage_path`. |
| 2026-08-05 | Added bounded link discovery from curated index pages; `seed_urls.yaml` grouped by topic with `index`/`discovery` flags. |
| 2026-08-06 | Allowlist extended to `search/query/norma.aspx` + `search/query/dcp/*` (recent norms 2024+); added 8 more topic indexes to `seed_urls.yaml` (facturación, IVA, bienes personales, régimen general, casas particulares, inscripción, viajeros, clave fiscal); `infer_document_type` reads the `p=t:TIPO` param of search URLs. |