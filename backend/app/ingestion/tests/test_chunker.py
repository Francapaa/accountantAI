# test_chunker.py — Tests unitarios del chunker (sin red).
"""Unit tests for the chunker (no network)."""

from app.ingestion.chunker import chunk_text


def _sample_paragraphs(n: int = 40) -> str:
    return "\n\n".join(f"Párrafo número {i} con contenido normativo suficiente para la prueba." for i in range(n))


def test_chunk_text_returns_ordered_chunks():
    chunks = chunk_text(_sample_paragraphs())
    assert len(chunks) >= 1
    indexes = [c.index for c in chunks]
    assert indexes == sorted(indexes)
    assert all(c.content for c in chunks)
    assert all(len(c.hash) == 64 for c in chunks)


def test_chunk_content_boundaries_respect_budget():
    chunks = chunk_text(_sample_paragraphs(), chunk_tokens=200, overlap_tokens=20)
    assert len(chunks) > 1
    for chunk in chunks:
        # rough upper bound: budget + one paragraph + overlap
        assert len(chunk.content) <= 200 * 4 + 200


def test_chunk_overlap_shares_tail():
    chunks = chunk_text(_sample_paragraphs(), chunk_tokens=100, overlap_tokens=60)
    assert len(chunks) >= 2
    prev_tail = chunks[0].content[-120:]
    assert prev_tail in chunks[1].content


def test_chunk_empty_text():
    assert chunk_text("") == []
    assert chunk_text("   \n\n  ") == []


def test_chunk_single_paragraph():
    chunks = chunk_text("Un único párrafo.")
    assert len(chunks) == 1
    assert "único" in chunks[0].content
