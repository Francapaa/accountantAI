# embedder.py — Genera embeddings con Google text-embedding-004 (1536 dims) por lote.
"""Embed chunk texts with Google text-embedding-004 (1536 dims).

Uses the google-genai SDK. Keeps a single client and supports batching to
amortize network latency. Never expose the API key to the frontend.
"""

from google import genai
from google.genai import types

from app.core.config import settings


class Embedder:
    def __init__(self, api_key: str | None = None) -> None:
        self._client = genai.Client(api_key=api_key or settings.gemini_api_key)

    def embed(self, texts: list[str]) -> list[list[float]]:
        """Embed a batch of texts, returning a list of vectors (1536 floats)."""
        vectors: list[list[float]] = []
        for start in range(0, len(texts), settings.embedding_batch_size):
            batch = texts[start : start + settings.embedding_batch_size]
            contents = [
                types.Content(parts=[types.Part(text=t)]) for t in batch
            ]
            resp = self._client.models.embed_content(
                model=settings.embedding_model,
                contents=contents,
                config=types.EmbedContentConfig(
                    output_dimensionality=settings.embedding_dimensions
                ),
            )
            for emb in resp.embeddings:
                vectors.append(list(emb.values))
        return vectors
