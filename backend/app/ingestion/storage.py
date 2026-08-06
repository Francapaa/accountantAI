# storage.py — Sube el raw (PDF/HTML) al bucket privado `normativa` y genera el storage_path.
"""Upload raw normativa sources to the private `normativa` Storage bucket.

Objects are reachable only by the backend service role (ingestion). Each
document references its object via `documents.storage_path`.
"""

from supabase import Client

from app.core.db import get_supabase_client

BUCKET = "normativa"


def _upload(client: Client, path: str, data: bytes, content_type: str) -> None:
    # supabase-py upload does not overwrite by default; remove first to be idempotent.
    try:
        client.storage.from_(BUCKET).remove([path])
    except Exception:
        pass
    client.storage.from_(BUCKET).upload(
        path,
        data,
        {"content-type": content_type},
    )


def storage_path_for(url: str, content_type: str, topic: str, suffix: str = "") -> str:
    """Deterministic object key inside the bucket.

    Derived from the URL hash so re-runs of the same source overwrite the
    same object (idempotent) and every document has a stable storage_path.
    """
    import hashlib

    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:12]
    ext = "pdf" if content_type == "application/pdf" else "html"
    topic_part = topic.strip().replace(" ", "_") if topic else "misc"
    return f"{topic_part}/{digest}{suffix}.{ext}"


def upload_raw(
    url: str,
    data: bytes,
    content_type: str,
    topic: str = "",
    client: Client | None = None,
) -> str:
    """Upload raw bytes to the bucket and return the storage_path."""
    path = storage_path_for(url, content_type, topic)
    _upload(client or get_supabase_client(), path, data, content_type)
    return path
