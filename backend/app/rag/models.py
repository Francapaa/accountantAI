# models.py — Tipos de datos para la recuperación RAG.
"""Pydantic models for the RAG retrieval module.

The shapes mirror the `public.match_documents` RPC return columns so the
retriever can map the Supabase response directly.
"""

from pydantic import BaseModel, Field


class RetrievedChunk(BaseModel):
    """A single matching chunk returned by `match_documents`."""

    document_id: str
    title: str
    document_type: str | None = None
    source_url: str | None = None
    content: str
    chunk_index: int
    similarity: float


class RetrievalQuery(BaseModel):
    """Input for a retrieval request."""

    query: str
    top_k: int = Field(default=5, ge=1, le=50)
    embedding_model: str | None = Field(default=None, description="Override the active embedding model filter.")


class RetrievalResult(BaseModel):
    """The retrieval outcome for a query."""

    query: str
    chunks: list[RetrievedChunk]