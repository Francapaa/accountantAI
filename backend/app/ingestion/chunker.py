# chunker.py — Divide el texto limpio en chunks solapados (~500 tokens / 50 de overlap).
"""Split cleaned text into overlapping chunks.

Chunking is paragraph-based with a token budget and a trailing overlap so
boundaries stay on natural breaks. Attribution is preserved downstream by
document_id + chunk_index (see docs/sdd/007-scraper.md).
"""

import hashlib
import re
from dataclasses import dataclass

_PARA_SPLIT_RE = re.compile(r"\n\s*\n")


@dataclass
class Chunk:
    index: int
    content: str
    hash: str


def _estimate_tokens(text: str) -> int:
    """Rough token estimate (~4 chars per token for Spanish/English)."""
    return max(1, len(text) // 4)


def chunk_text(
    text: str,
    chunk_tokens: int = 500,
    overlap_tokens: int = 50,
) -> list[Chunk]:
    """Return a list of overlapping Chunk objects."""
    paragraphs = [p.strip() for p in _PARA_SPLIT_RE.split(text) if p.strip()]
    if not paragraphs:
        return []

    chunk_char_target = chunk_tokens * 4
    overlap_char = overlap_tokens * 4

    chunks: list[Chunk] = []
    current: list[str] = []
    current_chars = 0

    for para in paragraphs:
        para_len = len(para)
        if current and current_chars + para_len > chunk_char_target:
            content = "\n\n".join(current)
            chunks.append(content)
            # keep trailing paragraphs that fit the overlap window
            overlap: list[str] = []
            used = 0
            for prev in reversed(current):
                if used + len(prev) > overlap_char:
                    break
                overlap.insert(0, prev)
                used += len(prev)
            current = overlap
            current_chars = used
        current.append(para)
        current_chars += para_len

    if current:
        chunks.append("\n\n".join(current))

    return [
        Chunk(index=i, content=content, hash=_chunk_hash(content))
        for i, content in enumerate(chunks)
    ]


def _chunk_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()
