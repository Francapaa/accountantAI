"""Meta Cloud API transport — the official WhatsApp transport (direct, no BSP).

See docs/sdd/010-whatsapp-adapter.md. Sends messages via the Graph API and normalizes
inbound webhook payloads into `ProviderInboundMessage`.
"""

from __future__ import annotations

import hashlib
import hmac
from datetime import datetime
from typing import Any

import httpx

from app.core.config import settings
from app.whatsapp.schemas import (
    ProviderInboundMessage,
    ProviderOutboundPayload,
)
from app.whatsapp.provider import IWhatsAppProvider

GRAPH_BASE_URL = "https://graph.facebook.com"
GRAPH_VERSION = "v21.0"
MESSAGE_KIND_FIELD = "type"


class MetaWebhookSignatureError(Exception):
    """Raised when the X-Hub-Signature-256 does not match the payload."""


class MetaCloudApiProvider:
    """Transport for the official Meta Cloud API (WhatsApp Business Platform)."""

    name = "meta"

    def __init__(self, *, access_token: str | None = None, app_secret: str | None = None) -> None:
        self._access_token = access_token or settings.whatsapp_access_token
        self._app_secret = app_secret or settings.whatsapp_app_secret
        self._http = httpx.AsyncClient(
            base_url=f"{GRAPH_BASE_URL}/{GRAPH_VERSION}",
            headers={"Authorization": f"Bearer {self._access_token}"},
        )

    async def aclose(self) -> None:
        await self._http.aclose()

    async def send_message(
        self, payload: ProviderOutboundPayload, *, phone_number_id: str
    ) -> str:
        """Send a message and return the provider message id (wamid)."""
        body: dict[str, Any] = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": payload.to,
        }

        if payload.template is not None:
            body["type"] = "template"
            body["template"] = {
                "name": payload.template.name,
                "language": {"code": payload.template.language},
                "components": [
                    {
                        "type": "body",
                        "parameters": [
                            {"type": "text", "text": p}
                            for p in payload.template.body_params
                        ],
                    }
                ],
            }
        elif payload.media is not None:
            body["type"] = payload.media.type
            body[payload.media.type] = {"link": payload.media.url}
        else:
            body["type"] = "text"
            body["text"] = {"body": payload.text}

        response = await self._http.post(
            f"/{phone_number_id}/messages",
            json=body,
        )
        response.raise_for_status()
        data = response.json()
        return data["messages"][0]["id"]

    def verify_signature(self, raw_body: bytes, signature: str) -> None:
        """Verify the X-Hub-Signature-256 header against the raw request body."""
        expected = hmac.new(
            self._app_secret.encode(), raw_body, hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, f"sha256={expected}"):
            raise MetaWebhookSignatureError("Invalid X-Hub-Signature-256")

    def parse_inbound(self, payload: dict[str, Any]) -> list[ProviderInboundMessage]:
        """Normalize a Meta webhook POST payload into inbound messages."""
        messages: list[ProviderInboundMessage] = []
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                if value.get("messaging_product") != "whatsapp":
                    continue
                from_number = value.get("metadata", {}).get("display_phone_number", "")
                phone_number_id = value.get("metadata", {}).get("phone_number_id")
                for msg in value.get("messages", []):
                    parsed = self._parse_single_message(
                        msg,
                        from_number=from_number,
                        phone_number_id=phone_number_id,
                    )
                    if parsed is not None:
                        messages.append(parsed)
        return messages

    @staticmethod
    def _parse_single_message(
        msg: dict[str, Any], *, from_number: str, phone_number_id: str | None = None
    ) -> ProviderInboundMessage | None:
        provider_message_id = msg.get("id")
        wa_id = msg.get("from")
        if not provider_message_id or not wa_id:
            return None

        kind = msg.get(MESSAGE_KIND_FIELD)
        text: str | None = None
        media = None
        if kind == "text":
            text = msg.get("text", {}).get("body")
        elif kind in {"image", "video", "audio", "document", "sticker"}:
            media_data = msg.get(kind, {})
            from app.whatsapp.schemas import MediaInfo
            media = MediaInfo(
                type=kind,
                id=media_data.get("id", ""),
                mime=media_data.get("mime"),
                url=media_data.get("url"),
                filename=media_data.get("filename"),
            )

        timestamp = datetime.now()
        try:
            raw_ts = int(msg.get("timestamp", "0"))
            if raw_ts > 0:
                timestamp = datetime.fromtimestamp(raw_ts)
        except (ValueError, TypeError, OSError):
            pass

        return ProviderInboundMessage(
            provider="meta",
            provider_message_id=provider_message_id,
            wa_id=wa_id,
            from_number=from_number,
            phone_number_id=phone_number_id,
            timestamp=timestamp,
            text=text,
            media=media,
            reply_to_id=msg.get("context", {}).get("id"),
        )