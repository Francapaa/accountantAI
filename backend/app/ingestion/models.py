# models.py — Dataclasses del pipeline de ingestión (Seed, RunSummary).
"""Data models for the ingestion pipeline."""

from dataclasses import dataclass, field


DOCUMENT_TYPES = ("FAQ", "Resolución", "Manual", "Ley", "Instructivo")


@dataclass
class Seed:
    url: str
    document_type: str
    title: str
    topic: str = ""
    index: bool = False
    discovery: bool = False
    discovered: bool = False
    source_seed_url: str | None = None

    def __post_init__(self) -> None:
        if self.document_type not in DOCUMENT_TYPES:
            raise ValueError(
                f"Invalid document_type '{self.document_type}' for {self.url}. "
                f"Allowed: {', '.join(DOCUMENT_TYPES)}"
            )


@dataclass
class RunSummary:
    processed: int = 0
    skipped: int = 0
    changed: int = 0
    failed: int = 0
    tombstoned: int = 0
    discovered: int = 0
    failures: list[tuple[str, str]] = field(default_factory=list)

    def add_failure(self, url: str, reason: str) -> None:
        self.failures.append((url, reason))
