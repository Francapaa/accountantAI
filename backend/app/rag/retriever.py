# retriever.py — Recuperación semántica sobre document_chunks vía match_documents.
"""Semantic retrieval over `document_chunks` using the `match_documents` RPC.

Flow: embed(query) -> rpc("match_documents", ...) -> RetrievedChunk list.

The embedder and the Supabase client are injectable so the module is testable
without real API calls. The RPC function lives in
`database/migrations/0011_match_documents.sql`; if it is not applied on the
target project the call raises a clear error.
"""

from app.core.config import settings
from app.core.db import get_supabase_client
from app.ingestion.embedder import Embedder
from app.rag.models import RetrievedChunk

from supabase import Client


class MatchDocumentsUnavailable(RuntimeError):
    """Raised when the `match_documents` RPC is not defined in the database."""


class Retriever:
    def __init__(
        self,
        embedder: Embedder | None = None,
        client: Client | None = None,
        min_similarity: float = 0.0,
    ) -> None:
        self._embedder = embedder or Embedder()
        self._client = client or get_supabase_client()
        self.min_similarity = min_similarity

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        embedding_model: str | None = None,
    ) -> list[RetrievedChunk]:
        """Embed the query and return the closest `top_k` chunks.

        `embedding_model` overrides the active model filter (defaults to the
        configured embedding model, matching what ingestion writes).
        """
        if not query.strip():
            raise ValueError("query must not be empty")

        query_embedding = self._embedder.embed([query])[0]
        match_filter = {
            "embedding_model": embedding_model or settings.embedding_model
        }

        resp = self._client.rpc(
            "match_documents",
            {
                "query_embedding": query_embedding,
                "match_count": top_k,
                "match_filter": match_filter,
            },
        ).execute()

        data = resp.data or []
        if _is_function_not_found(data):
            raise MatchDocumentsUnavailable(
                "The `match_documents` RPC is not defined. "
                "Apply database/migrations/0011_match_documents.sql to your "
                "Supabase project."
            )

        chunks = [
            RetrievedChunk(
                document_id=str(row["document_id"]),
                title=row["title"],
                document_type=row.get("document_type"),
                source_url=row.get("source_url"),
                content=row["content"],
                chunk_index=int(row["chunk_index"]),
                similarity=float(row["similarity"]),
            )
            for row in data
        ]
        return [c for c in chunks if c.similarity >= self.min_similarity]


def _is_function_not_found(data: list[dict]) -> bool:
    if not data:
        return False
    first = data[0]
    return (
        isinstance(first, dict)
        and "message" in first
        and "match_documents" in str(first.get("message", ""))
    )
