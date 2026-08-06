# repository.py — Persistencia de documents + document_chunks (upsert, reemplazo de chunks, tombstones).
"""Persistence for `documents` and `document_chunks`.

All writes run with the service role (bypasses RLS). The normativa corpus is
read-only for end users; ingestion is the only writer.
"""

import json
from datetime import datetime, timezone

from supabase import Client

from app.core.config import settings
from app.core.db import get_supabase_client


def _client(client: Client | None) -> Client:
    return client or get_supabase_client()


def get_document_by_url(url: str, client: Client | None = None) -> dict | None:
    resp = (
        _client(client)
        .table("documents")
        .select("*")
        .eq("source_url", url)
        .limit(1)
        .execute()
    )
    rows = resp.data or []
    return rows[0] if rows else None


def upsert_document(
    *,
    url: str,
    title: str,
    document_type: str,
    storage_path: str,
    content_hash: str,
    topic: str = "",
    client: Client | None = None,
) -> str:
    """Upsert a document row by unique source_url, return its id."""
    payload = {
        "source_url": url,
        "title": title,
        "document_type": document_type,
        "storage_path": storage_path,
        "content_hash": content_hash,
        "status": "scraped",
        "is_active": True,
        "crawled_at": datetime.now(timezone.utc).isoformat(),
    }
    resp = (
        _client(client)
        .table("documents")
        .upsert(payload, on_conflict="source_url")
        .execute()
    )
    return resp.data[0]["id"]


def replace_chunks(
    document_id: str,
    chunks: list[tuple[int, str, list[float], str]],
    client: Client | None = None,
) -> None:
    """Delete existing chunks of a document and insert the new ones atomically."""
    c = _client(client)
    c.table("document_chunks").delete().eq("document_id", document_id).execute()

    rows = [
        {
            "document_id": document_id,
            "chunk_index": idx,
            "content": content,
            "embedding": json.dumps(vector),
            "embedding_model": settings.embedding_model,
            "chunk_hash": chunk_hash,
        }
        for idx, content, vector, chunk_hash in chunks
    ]
    if rows:
        for start in range(0, len(rows), _CHUNK_INSERT_BATCH):
            c.table("document_chunks").insert(rows[start : start + _CHUNK_INSERT_BATCH]).execute()


# Insert chunks in batches so a single statement never times out on
# Supabase (a large law document can yield thousands of rows).
_CHUNK_INSERT_BATCH = 500


def tombstone(url: str, client: Client | None = None) -> None:
    """Mark a document inactive (404/gone) without deleting the row."""
    _client(client).table("documents").update({"is_active": False}).eq(
        "source_url", url
    ).execute()
