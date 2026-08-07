# test_service.py — Webhook routing/dedup/persistence with an in-memory fake.
"""Tests the inbound ingestion service router (no network/DB)."""

from __future__ import annotations

from datetime import datetime

from app.whatsapp.schemas import ProviderInboundMessage
from app.whatsapp.service import ingest_inbound, normalize_phone
from app.whatsapp.tests.fakes import FakeSupabase


def _msg(phone_number_id="conn-1", wa_id="5411001122", text="Hola", mid="wamid.1"):
    return ProviderInboundMessage(
        provider="meta",
        provider_message_id=mid,
        wa_id=wa_id,
        from_number="1555333000",
        phone_number_id=phone_number_id,
        timestamp=datetime(2026, 8, 7, 12, 0, 0),
        text=text,
    )


def test_normalize_phone_keeps_only_digits():
    assert normalize_phone("+54 9 11 5555-3333") == "5491155553333"


def test_ingest_returns_false_when_no_phone_number_id():
    fake = FakeSupabase()
    assert ingest_inbound(fake, _msg(phone_number_id=None)) is False
    assert fake.tables["messages"] == []


def test_ingest_returns_false_when_number_not_linked():
    fake = FakeSupabase()
    assert ingest_inbound(fake, _msg()) is False
    assert fake.tables["messages"] == []


def test_ingest_matches_existing_client_by_phone():
    fake = FakeSupabase()
    fake.tables["clients"].append({"id": "c-1", "owner_id": "u-1", "phone": "+54 9 11 0001122"})
    fake.tables["conversations"].append({"id": "convo-1", "client_id": "c-1", "owner_id": "u-1"})
    fake.tables["whatsapp_connections"].append(
        {"id": "conn-1", "owner_id": "u-1", "phone_number_id": "551-1"}
    )

    ingested = ingest_inbound(fake, _msg(phone_number_id="551-1", wa_id="+54 9 11 0001122"))

    assert ingested is True
    assert len(fake.tables["messages"]) == 1
    msg = fake.tables["messages"][0]
    assert msg["conversation_id"] == "convo-1"
    assert msg["direction"] == "inbound"
    assert msg["status"] == "received"
    assert msg["provider_message_id"] == "wamid.1"
    assert msg["content"] == "Hola"


def test_ingest_creates_placeholder_client_for_unknown_sender():
    fake = FakeSupabase()
    fake.tables["whatsapp_connections"].append(
        {"id": "conn-1", "owner_id": "u-1", "phone_number_id": "551-1"}
    )

    ingested = ingest_inbound(fake, _msg(phone_number_id="551-1", wa_id="549110009999"))

    assert ingested is True
    assert fake.tables["clients"]  # placeholder created
    assert fake.tables["conversations"]  # conversation created
    assert len(fake.tables["messages"]) == 1


def test_ingest_deduplicates_by_provider_message_id():
    fake = FakeSupabase()
    fake.tables["clients"].append({"id": "c-1", "owner_id": "u-1", "phone": "549110001122"})
    fake.tables["conversations"].append({"id": "convo-1", "client_id": "c-1", "owner_id": "u-1"})
    fake.tables["whatsapp_connections"].append(
        {"id": "conn-1", "owner_id": "u-1", "phone_number_id": "551-1"}
    )

    first = ingest_inbound(fake, _msg(phone_number_id="551-1", mid="wamid.dup"))
    second = ingest_inbound(fake, _msg(phone_number_id="551-1", mid="wamid.dup"))

    assert first is True
    assert second is False
    assert len(fake.tables["messages"]) == 1