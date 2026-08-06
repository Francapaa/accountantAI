# pipeline.py — Orquesta la ingestión: resolve seeds, discovery y procesamiento idempotente por URL.
"""Ingestion pipeline: resolve seeds, discover links, ingest each source.

Idempotent by source_url + content_hash:
  - same hash      -> skip (no re-upload, no re-embed)
  - hash changed   -> re-upload raw, re-parse, re-chunk, re-embed, replace chunks
  - 404/gone       -> tombstone (is_active = false)
Failures are isolated per URL and never abort the batch.
"""

import hashlib
import logging
import time

from supabase import Client

from app.core.config import settings
from app.core.db import get_supabase_client
from app.ingestion import repository
from app.ingestion.discovery import extract_discovered_seeds
from app.ingestion.download import DisallowedError, Fetcher, NotFoundError
from app.ingestion.embedder import Embedder
from app.ingestion.loader import load_seeds
from app.ingestion.models import RunSummary, Seed
from app.ingestion.parser import parse
from app.ingestion.storage import upload_raw
from app.ingestion.chunker import chunk_text

logger = logging.getLogger(__name__)


def _hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def ingest_seed(
    seed: Seed,
    fetcher: Fetcher,
    embedder: Embedder,
    client: Client,
    summary: RunSummary,
) -> None:
    existing = repository.get_document_by_url(seed.url, client)

    try:
        result = fetcher.fetch(seed.url)
    except NotFoundError:
        if existing:
            repository.tombstone(seed.url, client)
            summary.tombstoned += 1
            logger.info("Tombstoned (404): %s", seed.url)
        else:
            logger.warning("404 for unknown URL (ignored): %s", seed.url)
        return
    except (DisallowedError, Exception) as exc:  # noqa: BLE001 - isolate per URL
        summary.failed += 1
        summary.add_failure(seed.url, str(exc))
        logger.error("Failed to fetch %s: %s", seed.url, exc)
        return

    content_type = result.content_type
    content_hash = _hash(result.data)

    if existing and existing.get("content_hash") == content_hash:
        summary.skipped += 1
        logger.info("Skipped (unchanged): %s", seed.url)
        return

    storage_path = upload_raw(
        seed.url, result.data, content_type, topic=seed.topic, client=client
    )
    text = parse(result.data, content_type)
    chunks = chunk_text(text)
    if not chunks:
        summary.failed += 1
        summary.add_failure(seed.url, "Empty parsed text")
        logger.error("Empty text after parsing: %s", seed.url)
        return

    vectors = embedder.embed([c.content for c in chunks])

    document_id = repository.upsert_document(
        url=seed.url,
        title=seed.title,
        document_type=seed.document_type,
        storage_path=storage_path,
        content_hash=content_hash,
        topic=seed.topic,
        client=client,
    )
    repository.replace_chunks(
        document_id,
        [(c.index, c.content, vectors[i], c.hash) for i, c in enumerate(chunks)],
        client=client,
    )
    summary.changed += 1
    summary.processed += 1
    logger.info("Ingested (%d chunks): %s", len(chunks), seed.url)


def resolve_candidates(seeds: list[Seed], fetcher: Fetcher, summary: RunSummary) -> list[Seed]:
    """Load curated seeds plus discovered links from index pages (depth 1)."""
    candidates = list(seeds)
    seen = {s.url for s in candidates}

    for seed in seeds:
        if not seed.discovery:
            continue
        try:
            result = fetcher.fetch(seed.url)
            html = result.data.decode("utf-8", errors="replace")
        except Exception as exc:  # noqa: BLE001 - isolate per index page
            summary.failed += 1
            summary.add_failure(seed.url, f"Discovery failed: {exc}")
            logger.error("Discovery failed for %s: %s", seed.url, exc)
            continue

        for discovered in extract_discovered_seeds(seed, html):
            if discovered.url in seen:
                continue
            seen.add(discovered.url)
            candidates.append(discovered)
            summary.discovered += 1
        time.sleep(settings.ingest_rate_limit_delay)

    return candidates


def run(client: Client | None = None, rate_limit: float | None = None) -> RunSummary:
    """Execute a full ingestion batch (idempotent)."""
    summary = RunSummary()
    client = client or get_supabase_client()
    delay = rate_limit if rate_limit is not None else settings.ingest_rate_limit_delay

    with Fetcher() as fetcher:
        embedder = Embedder()
        candidates = resolve_candidates(load_seeds(), fetcher, summary)
        logger.info("Resolved %d candidates (%d curated + %d discovered)",
                    len(candidates),
                    len(load_seeds()),
                    summary.discovered)

        for seed in candidates:
            ingest_seed(seed, fetcher, embedder, client, summary)
            time.sleep(delay)

    return summary
