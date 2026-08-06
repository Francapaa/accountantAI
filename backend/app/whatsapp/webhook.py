"""Meta Cloud API webhook router.

- GET  returns the challenge to confirm webhook subscription.
- POST ingests inbound events after verifying the X-Hub-Signature-256 HMAC.

See docs/sdd/010-whatsapp-adapter.md.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, HTTPException, Request, status

from app.core.config import settings
from app.whatsapp.meta import MetaCloudApiProvider, MetaWebhookSignatureError

router = APIRouter()

provider = MetaCloudApiProvider()


@router.get("/api/whatsapp/webhook")
def verify_webhook(
    hub_mode: str | None = None,
    hub_verify_token: str | None = None,
    hub_challenge: str | None = None,
) -> dict[str, Any]:
    """Confirm the webhook subscription by echoing the challenge back."""
    if (
        hub_mode == "subscribe"
        and hub_verify_token == settings.whatsapp_verify_token
        and hub_challenge is not None
    ):
        return {"challenge": hub_challenge}
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verification token mismatch")


@router.post("/api/whatsapp/webhook")
async def receive_events(
    request: Request,
    x_hub_signature_256: str | None = Header(default=None),
) -> dict[str, str]:
    """Ingest WhatsApp events, verified against the app secret."""
    raw_body = await request.body()
    if not x_hub_signature_256:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing signature header",
        )

    try:
        provider.verify_signature(raw_body, x_hub_signature_256)
    except MetaWebhookSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature",
        )

    payload = await request.json()
    messages = provider.parse_inbound(payload)
    # TODO: persist messages (dedup by provider_message_id) and forward to the
    # chat/RAG pipeline. See docs/sdd/010-whatsapp-adapter.md workflows.
    return {"status": "received", "messages": len(messages)}