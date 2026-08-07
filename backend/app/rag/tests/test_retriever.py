# test_retriever.py — Tests del retriever con fakes (sin red/DB/Gemini).
"""Retriever tests with a fake embedder and a fake Supabase client."""

import pytest

from app.core import config
from app.rag import retriever as retriever_module
from app.rag.models import RetrievedChunk, RetrievalQuery, RetrievalResult
from app.rag.retriever import MatchDocumentsUnavailable, Retriever
from app.rag.service import retrieve


class _FakeEmbedder:
    def __init__(self, vector=None):
        self.vector = vector or [0.5] * 1536
        self.texts: list[str] = []

    def embed(self, texts):
        self.texts.extend(texts)
        return [self.vector for _ in texts]


class _FakeExecute:
    def __init__(self, data):
        self._data = data
        self.data = data


class _FakeRpc:
    def __init__(self, client):
        self.client = client

    def execute(self):
        return _FakeExecute(self.client._rpc_result)


class _FakeClient:
    def __init__(self, rpc_result):
        self._rpc_result = rpc_result
        self.rpc_calls: list[dict] = []

    def rpc(self, name, params):
        self.rpc_calls.append((name, params))
        return _FakeRpc(self)


def _row(**overrides):
    base = {
        "document_id": "doc-1",
        "title": "Monotributo",
        "document_type": "Manual",
        "source_url": "https://www.arca.gob.ar/monotributo",
        "content": "La recategorización se realiza...",
        "chunk_index": 3,
        "similarity": 0.91,
    }
    base.update(overrides)
    return base


def _make_retriever(rpc_result, **kwargs) -> tuple[Retriever, _FakeClient, _FakeEmbedder]:
    client = _FakeClient(rpc_result)
    embedder = _FakeEmbedder()
    r = Retriever(embedder=embedder, client=client, **kwargs)
    return r, client, embedder


def test_retrieve_calls_rpc_with_default_model(monkeypatch):
    r, client, _ = _make_retriever([_row()])
    monkeypatch.setattr(config.settings, "embedding_model", "gemini-embedding-2")

    result = r.retrieve("¿puedo facturar?")

    assert len(result) == 1
    name, params = client.rpc_calls[0]
    assert name == "match_documents"
    assert params["query_embedding"] == [0.5] * 1536
    assert params["match_count"] == 5
    assert params["match_filter"] == {"embedding_model": "gemini-embedding-2"}


def test_retrieve_maps_columns():
    r, _, _ = _make_retriever([_row(similarity=0.83, document_type=None)])
    result = r.retrieve("consultar")

    chunk = result[0]
    assert isinstance(chunk, RetrievedChunk)
    assert chunk.document_id == "doc-1"
    assert chunk.chunk_index == 3
    assert chunk.similarity == 0.83
    assert chunk.document_type is None


def test_retrieve_rejects_empty_query():
    r, _, _ = _make_retriever([_row()])
    with pytest.raises(ValueError):
        r.retrieve("   ")


def test_retrieve_respects_min_similarity():
    rows = [_row(similarity=0.95), _row(similarity=0.40)]
    r, _, _ = _make_retriever(rows, min_similarity=0.5)
    result = r.retrieve("consultar")
    assert [c.similarity for c in result] == [0.95]


def test_retrieve_function_not_found_raises():
    r, _, _ = _make_retriever(
        [{"message": 'Could not find the function public.match_documents "..." '}]
    )
    with pytest.raises(MatchDocumentsUnavailable):
        r.retrieve("consultar")


def test_retrieve_embedding_model_override(monkeypatch):
    client = _FakeClient([_row()])
    embedder = _FakeEmbedder()
    r = Retriever(embedder=embedder, client=client)
    monkeypatch.setattr(config.settings, "embedding_model", "default-model")

    r.retrieve("consultar", embedding_model="other-model")

    _, params = client.rpc_calls[0]
    assert params["match_filter"] == {"embedding_model": "other-model"}


def test_service_retrieve_returns_result():
    client = _FakeClient([_row()])
    embedder = _FakeEmbedder()
    r = Retriever(embedder=embedder, client=client)

    result = retrieve(RetrievalQuery(query="¿cuándo vence?"), retriever=r)

    assert isinstance(result, RetrievalResult)
    assert result.query == "¿cuándo vence?"
    assert len(result.chunks) == 1