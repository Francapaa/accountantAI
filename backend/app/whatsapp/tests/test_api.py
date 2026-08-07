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


def test_send_message_happy_path(client, monkeypatch):
    http, fake = client
    fake.tables["conversations"].append(
        {"id": "convo-1", "client_id": "client-1", "owner_id": "u_1"}
    )
    fake.tables["clients"].append({"id": "client-1", "owner_id": "u_1", "phone": "549110001122"})
    fake.tables["whatsapp_connections"].append(
        {"id": "conn-1", "owner_id": "u_1", "phone_number_id": "551-777"}
    )

    class FakeProvider:
        async def send_message(self, payload, *, phone_number_id):
            assert payload.to == "549110001122"
            assert phone_number_id == "551-777"
            return "wamid.output"

        async def aclose(self):
            return None

    monkeypatch.setattr(whatsapp_api, "MetaCloudApiProvider", lambda: FakeProvider())

    res = http.post(
        "/api/whatsapp/messages", json={"conversation_id": "convo-1", "text": "Sí, vence hoy"}
    )

    assert res.status_code == 200
    assert res.json()["status"] == "sent"
    assert len(fake.tables["messages"]) == 1
    msg = fake.tables["messages"][0]
    assert msg["direction"] == "outbound"
    assert msg["status"] == "sent"
    assert msg["provider_message_id"] == "wamid.output"


def test_send_message_requires_connection(client):
    http, fake = client
    fake.tables["conversations"].append(
        {"id": "convo-1", "client_id": "client-1", "owner_id": "u_1"}
    )
    fake.tables["clients"].append({"id": "client-1", "owner_id": "u_1", "phone": "549110000000"})

    res = http.post("/api/whatsapp/messages", json={"conversation_id": "convo-1", "text": "Hola"})

    assert res.status_code == 400