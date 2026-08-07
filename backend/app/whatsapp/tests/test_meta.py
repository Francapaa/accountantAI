# test_meta.py — Meta Cloud API transport (signature, parse, send) — no network.
"""Tests for MetaCloudApiProvider: signature verification, inbound parsing, send payload."""

from __future__ import annotations

import hmac
import hashlib

import pytest

from app.whatsapp import meta
from app.whatsapp.meta import (
    MetaCloudApiProvider,
    MetaWebhookSignatureError,
)
from app.whatsapp.schemas import ProviderOutboundPayload, TemplateRef

APP_SECRET = "test-app-secret"


@pytest.fixture
def provider() -> MetaCloudApiProvider:
    p = MetaCloudApiProvider(access_token="tok", app_secret=APP_SECRET)
    return p


def _signature(body: bytes, secret: str = APP_SECRET) -> str:
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return f"sha256={expected}"


def test_verify_signature_accepts_valid(provider):
    body = b'{"a":1}'
    provider.verify_signature(body, _signature(body))  # should not raise


def test_verify_signature_rejects_wrong(provider):
    body = b'{"a":1}'
    with pytest.raises(MetaWebhookSignatureError):
        provider.verify_signature(body, "sha256=deadbeef")


def _webhook_payload():
    return {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "waba-1",
                "changes": [
                    {
                        "field": "messages",
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "15551234567",
                                "phone_number_id": "987654321",
                            },
                            "contacts": [{"profile": {"name": "Cliente"}}],
                            "messages": [
                                {
                                    "from": "549110001122",
                                    "id": "wamid.abc123",
                                    "timestamp": "1723000000",
                                    "type": "text",
                                    "text": {"body": "Hola, ¿cuándo vence?"},
                                }
                            ],
                        },
                    }
                ],
            }
        ],
    }


def test_parse_inbound_normalizes_text_message(provider):
    msgs = provider.parse_inbound(_webhook_payload())
    assert len(msgs) == 1
    m = msgs[0]
    assert m.provider == "meta"
    assert m.provider_message_id == "wamid.abc123"
    assert m.wa_id == "549110001122"
    assert m.from_number == "15551234567"
    assert m.phone_number_id == "987654321"
    assert m.text == "Hola, ¿cuándo vence?"
    assert m.media is None


def test_parse_inbound_defaults_phone_number_id_to_none():
    payload = _webhook_payload()
    del payload["entry"][0]["changes"][0]["value"]["metadata"]["phone_number_id"]
    msgs = MetaCloudApiProvider(access_token="tok", app_secret="s").parse_inbound(payload)
    assert msgs[0].phone_number_id is None


class _FakeResp:
    def raise_for_status(self):
        return None

    def json(self):
        return {"messages": [{"id": "wamid.outbound"}]}


def test_send_message_builds_text_payload_and_returns_id(provider, monkeypatch):
    class FakeHttp:
        async def post(self, url, json):
            assert url == "/phone1/messages"
            assert json["type"] == "text"
            assert json["text"]["body"] == "Respuesta"
            return _FakeResp()

    monkeypatch.setattr(provider, "_http", FakeHttp())

    async def run():
        return await provider.send_message(
            ProviderOutboundPayload(to="1551001", text="Respuesta"),
            phone_number_id="phone1",
        )

    import asyncio

    assert asyncio.run(run()) == "wamid.outbound"


def test_send_message_template_uses_template_ref(provider, monkeypatch):
    class FakeHttp:
        async def post(self, url, json):
            assert json["type"] == "template"
            assert json["template"]["name"] == "saludo"
            return _FakeResp()

    monkeypatch.setattr(provider, "_http", FakeHttp())

    async def run():
        return await provider.send_message(
            ProviderOutboundPayload(
                to="15551001",
                template=TemplateRef(name="saludo", body_params=["Juan"]),
            ),
            phone_number_id="phone1",
        )

    import asyncio

    assert asyncio.run(run()) == "wamid.outbound"