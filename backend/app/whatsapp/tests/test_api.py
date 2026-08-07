# test_api.py — Authenticated WhatsApp endpoints (connections + send) via TestClient.
"""Tests for /api/whatsapp/* endpoints with an in-memory fake + mocked provider."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.api.auth import CurrentUser
from app.api import whatsapp as whatsapp_api
from app.main import app
from app.whatsapp.tests.fakes import FakeSupabase


@pytest.fixture
def client(monkeypatch) -> tuple[TestClient, FakeSupabase]:
    fake = FakeSupabase()
    app.dependency_overrides[whatsapp_api.get_current_user] = lambda: CurrentUser(
        id="u_1", email="contador@x.com"
    )
    monkeypatch.setattr(whatsapp_api, "get_supabase_client", lambda: fake)
    return TestClient(app), fake


def test_list_connections_empty(client):
    http, _ = client
    res = http.get("/api/whatsapp/connections")
    assert res.status_code == 200
    assert res.json() == {"connections": []}


def test_create_connection(client):
    http, fake = client
    res = http.post(
        "/api/whatsapp/connections",
        json={"waba_id": "waba-1", "phone": "+54 9 11 5555-3333", "phone_number_id": "551-777"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["phone"] == "5491155553333"  # normalized
    assert body["status"] == "pending"
    assert fake.tables["whatsapp_connections"]


def test_delete_connection_owner_scoped(client):
    http, fake = client
    fake.tables["whatsapp_connections"].append(
        {"id": "conn-1", "owner_id": "u_1", "phone_number_id": "551-777", "waba_id": "waba-1"}
    )
    res = http.delete("/api/whatsapp/connections/conn-1")
    assert res.status_code == 200
    assert fake.tables["whatsapp_connections"] == []


def test_delete_connection_not_found(client):
    http, _ = client
    res = http.delete("/api/whatsapp/connections/nope")
    assert res.status_code == 404


def test_save_draft_persists_without_sending(client, monkeypatch):
    http, fake = client
    fake.tables["conversations"].append(
        {"id": "convo-1", "client_id": "client-1", "owner_id": "u_1"}
    )

    called = []

    class FakeProvider:
        def __init__(self):
            pass

        async def send_message(self, payload, *, phone_number_id):
            called.append(True)
            return "wamid"

        async def aclose(self):
            return None

    monkeypatch.setattr(whatsapp_api, "MetaCloudApiProvider", lambda: FakeProvider())

    res = http.post(
        "/api/whatsapp/drafts",
        json={"conversation_id": "convo-1", "text": "Respuesta borrador"},
    )

    assert res.status_code == 201
    assert res.json()["status"] == "draft"
    assert called == []  # provider NOT invoked on save
    assert len(fake.tables["messages"]) == 1
    assert fake.tables["messages"][0]["status"] == "draft"
    assert fake.tables["messages"][0]["direction"] == "outbound"


def test_save_draft_requires_conversation_ownership(client):
    http, fake = client
    res = http.post(
        "/api/whatsapp/drafts",
        json={"conversation_id": "nope", "text": "Hola"},
    )
    assert res.status_code == 404


def test_approve_draft_calls_provider_and_marks_inbound_sent(client, monkeypatch):
    http, fake = client
    fake.tables["conversations"].append(
        {"id": "convo-1", "client_id": "client-1", "owner_id": "u_1"}
    )
    fake.tables["clients"].append({"id": "client-1", "owner_id": "u_1", "phone": "549110001122"})
    fake.tables["whatsapp_connections"].append(
        {"id": "conn-1", "owner_id": "u_1", "phone_number_id": "551-777"}
    )
    fake.tables["messages"].append(
        {
            "id": "inbound-1",
            "conversation_id": "convo-1",
            "role": "user",
            "content": "¿Cuándo vence?",
            "direction": "inbound",
            "status": "received",
        }
    )
    fake.tables["messages"].append(
        {
            "id": "draft-1",
            "conversation_id": "convo-1",
            "role": "assistant",
            "content": "Vence hoy",
            "direction": "outbound",
            "status": "draft",
            "reply_to_message_id": "inbound-1",
        }
    )

    sent_to = {}

    class FakeProvider:
        def __init__(self):
            pass

        async def send_message(self, payload, *, phone_number_id):
            sent_to["to"] = payload.to
            sent_to["phone_number_id"] = phone_number_id
            sent_to["text"] = payload.text
            return "wamid.approved"

        async def aclose(self):
            return None

    monkeypatch.setattr(whatsapp_api, "MetaCloudApiProvider", lambda: FakeProvider())

    res = http.post("/api/whatsapp/drafts/draft-1/approve")

    assert res.status_code == 200
    assert res.json()["status"] == "sent"
    assert sent_to["to"] == "549110001122"
    assert sent_to["phone_number_id"] == "551-777"
    assert sent_to["text"] == "Vence hoy"

    by_id = {m["id"]: m for m in fake.tables["messages"]}
    assert by_id["draft-1"]["status"] == "sent"
    assert by_id["draft-1"]["provider_message_id"] == "wamid.approved"
    assert by_id["inbound-1"]["status"] == "sent"  # replied-to inbound marked sent


def test_approve_draft_requires_connection(client):
    http, fake = client
    fake.tables["conversations"].append(
        {"id": "convo-1", "client_id": "client-1", "owner_id": "u_1"}
    )
    fake.tables["clients"].append({"id": "client-1", "owner_id": "u_1", "phone": "549110000000"})
    fake.tables["messages"].append(
        {
            "id": "draft-1",
            "conversation_id": "convo-1",
            "role": "assistant",
            "content": "Vence hoy",
            "direction": "outbound",
            "status": "draft",
        }
    )

    res = http.post("/api/whatsapp/drafts/draft-1/approve")

    assert res.status_code == 400


def test_approve_draft_not_found_or_not_draft(client):
    http, fake = client
    res = http.post("/api/whatsapp/drafts/ghost/approve")
    assert res.status_code == 404