# 008 — Nightly Sync (Cron)

> Status: Accepted · Last updated: 2026-08-04 · Owner: backend

## Purpose

Keep the vectorized normativa knowledge base up to date automatically. Each night, check every
known source URL; only re-download, re-chunk, and re-embed **when content actually changed**.

## Scope

**In scope:**
- Scheduled nightly run.
- Cheap change detection via content hash.
- Incremental re-embedding only for changed documents.
- Tombstoning removed sources (404).
- Logging/metrics of the run.

**Out of scope:**
- Scraper internals (see [007](./007-scraper.md)).
- RAG query path (see [006](./006-rag-pipeline.md)).
- Manual ingest path (see [007](./007-scraper.md)).

## Technical Decisions

| Decision | Choice |
|---|---|
| Scheduler | Backend embedded scheduler (e.g. APScheduler) or external cron, run nightly (e.g. 03:00) |
| Change detection | **SHA-256 of raw downloaded content** vs stored `content_hash` (robust even when ETag/last-modified are unavailable) |
| Re-index strategy | Hash changed → download → parse → chunk → delete old chunks → insert new (per document) |
| Removal | 404/gone → `is_active = false` (tombstone, keep row) |
| Cost control | Unchanged docs are skipped — no embedding cost, no writes |
| Batch resilience | Per-URL isolation; a failure does not abort the batch |

## Nightly Algorithm

```
For each active source_url:
  cheap check: fetch headers / minimal content → hash
  if hash == stored content_hash:
     continue                     # NO op
  else:
     download full content
     re-parse → re-clean → re-chunk
     delete existing chunks of the document
     re-embed each chunk
     upsert chunks + update document metadata (content_hash, last_modified, crawled_at)
  if source gone (404):
     set is_active = false        # tombstone
     continue
Write run report: processed, skipped, changed, embedded, failed, tombstoned
```

## Concurrency & Idempotency

- Run is **idempotent**: re-running produces the same state.
- A single changed document is processed atomically within one transaction (delete+insert chunks).
- Concurrent runs are prevented via a scheduler lock to avoid double-processing.

## Workflows

**Given** a source whose content is unchanged, **when** the nightly run executes, **then** it is
skipped (no download of full body, no re-embed).

**Given** a source whose content changed, **when** the nightly run executes, **then** it is
re-downloaded, re-chunked, re-embedded, and the stored hash is updated.

**Given** a source that returns 404, **when** the nightly run executes, **then** its document is
marked `is_active=false` (not deleted).

**Given** a batch with some failing URLs, **when** the run finishes, **then** failures are
recorded with reason and do not stop the rest.

## Acceptance Criteria

1. The job runs nightly and is idempotent.
2. Unchanged documents are skipped (verified via hash) — no unnecessary embedding cost.
3. Changed documents are fully re-indexed with updated chunks and hash.
4. 404 sources are tombstoned (`is_active=false`) without deletion.
5. A failed URL does not abort the batch and is retried next run.
6. Run report (processed/skipped/changed/failed) is logged.
7. A lock prevents overlapping runs.

## Open Questions

- Exact run time and cadence (nightly vs weekly) — nightly default; configurable.
- Retention of run reports (DB table vs logs) — TBD; logs in MVP.

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | Nightly cron sync spec created with hash-based incremental updates. |