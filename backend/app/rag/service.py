# service.py — Orquestación de la recuperación RAG.
"""Single entry point for semantic retrieval over the normativa corpus.

Consumers (e.g. a future chat endpoint) call `retrieve()` and get the query
back together with its matching chunks.
"""

from app.rag.models import RetrievedChunk, RetrievalQuery, RetrievalResult
from app.rag.retriever import Retriever


def retrieve(
    request: RetrievalQuery,
    retriever: Retriever | None = None,
) -> RetrievalResult:
    """Embed `request.query` and return the closest chunks."""
    r = retriever or Retriever()
    chunks: list[RetrievedChunk] = r.retrieve(
        query=request.query,
        top_k=request.top_k,
        embedding_model=request.embedding_model,
    )
    return RetrievalResult(query=request.query, chunks=chunks)
