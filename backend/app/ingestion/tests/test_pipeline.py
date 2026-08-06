# test_pipeline.py — Tests de orquestación del pipeline con fakes en memoria (sin red/DB).
"""Pipeline orchestration tests with in-memory fakes (no network/DB)."""

from types import ModuleType

import pytest

from app.ingestion import pipeline
from app.ingestion.models import RunSummary, Seed

_HTML = (
    "<html><body><div id=\"contenido\"><h1>X</h1><p>"
    + "Párrafo normativo. " * 50
    + "</p></div></body></html>"
)


class FakeFetcher:
    def __init__(self, body: bytes = _HTML.encode("utf-8")) -> None:
        self.body = body
        self.urls: list[str] = []

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return None

    def fetch(self, url: str):
        self.urls.append(url)

        class R:
            content_type = "text/html"

        r = R()
        r.data = self.body
        return r


class _Response:
    content_type = "text/html"

    def __init__(self, data: bytes) -> None:
        self.data = data


class _FakeRepo(ModuleType):
    def __init__(self) -> None:
        super().__init__("fake_repo")
        self.docs: dict[str, dict] = {}
        self.chunks: dict[str, list] = {}

    def get_document_by_url(self, url, client=None):
        return self.docs.get(url)

    def upsert_document(self, **kw):
        self.docs[kw["url"]] = {"id": kw["url"], "content_hash": kw["content_hash"]}
        return kw["url"]

    def replace_chunks(self, document_id, chunks, client=None):
        self.chunks[document_id] = chunks

    def tombstone(self, url, client=None):
        self.docs.setdefault(url, {})["is_active"] = False


class _FakeEmbedder:
    def embed(self, texts):
        return [[0.1] * 3 for _ in texts]


@pytest.fixture
def env(monkeypatch):
    repo = _FakeRepo()
    monkeypatch.setattr(pipeline, "repository", repo)
    monkeypatch.setattr(pipeline, "upload_raw", lambda *a, **k: "fake/path.html")
    fetcher = FakeFetcher()
    embedder = _FakeEmbedder()
    return repo, fetcher, embedder


def _seed(url="https://www.arca.gob.ar/monotributo/default.asp") -> Seed:
    return Seed(
        url=url,
        document_type="Manual",
        title="Monotributo",
        topic="monotributo",
    )


def test_ingest_seed_uploads_and_chunks(env):
    repo, fetcher, embedder = env
    summary = RunSummary()
    seed = _seed()

    pipeline.ingest_seed(seed, fetcher, embedder, repo, summary)

    assert summary.changed == 1
    assert summary.processed == 1
    assert seed.url in repo.docs
    assert seed.url in repo.chunks
    assert len(repo.chunks[seed.url]) >= 1


def test_ingest_seed_is_idempotent(env):
    repo, fetcher, embedder = env
    seed = _seed()

    pipeline.ingest_seed(seed, fetcher, embedder, repo, RunSummary())
    summary = RunSummary()
    pipeline.ingest_seed(seed, fetcher, embedder, repo, summary)

    assert summary.skipped == 1
    assert summary.changed == 0


def test_ingest_seed_tombstones_404(env, monkeypatch):
    repo, fetcher, embedder = env
    url = "https://x/404"
    seed = Seed(url=url, document_type="Manual", title="N", topic="t")
    repo.docs[url] = {"id": "id-1", "is_active": True, "content_hash": "old"}

    def _fetch(url):
        raise pipeline.NotFoundError()

    monkeypatch.setattr(fetcher, "fetch", _fetch)
    summary = RunSummary()
    pipeline.ingest_seed(seed, fetcher, embedder, repo, summary)

    assert summary.tombstoned == 1
    assert repo.docs[url]["is_active"] is False


def test_ingest_seed_isolates_failures(env):
    repo, fetcher, embedder = env
    seed = Seed(url="https://x/boom", document_type="Manual", title="N", topic="t")

    def _fetch(url):
        raise RuntimeError("network down")

    fetcher.fetch = _fetch  # type: ignore[assignment]
    summary = RunSummary()
    pipeline.ingest_seed(seed, fetcher, embedder, repo, summary)

    assert summary.failed == 1
    assert summary.failures == [("https://x/boom", "network down")]
