"""Normalized, transport-agnostic WhatsApp message contracts.

These are the only shapes the core knows about. They never expose provider internals so
that swapping `MetaCloudApiProvider` for any other transport does not touch core code.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

MediaType = Literal["image", "video", "audio", "document", "sticker"]


class MediaInfo(BaseModel):
    """Metadata about media attached to an inbound message."""

    type: MediaType
    id: str
    mime: str | None = None
    url: str | None = None
    filename: str | None = None
    size: int | None = None


class MediaInput(BaseModel):
    """Media to attach to an outbound message (raw or already uploaded to Meta)."""

    type: MediaType
    url: str
    mime: str | None = None
    caption: str | None = None


class TemplateRef(BaseModel):
    """Reference to an approved Meta template, used for out-of-window sends."""

    name: str
    language: str = "es_AR"
    body_params: list[str] = Field(default_factory=list)


class ProviderInboundMessage(BaseModel):
    """A message received from WhatsApp via a provider webhook."""

    provider: str
    provider_message_id: str
    wa_id: str
    from_number: str
    phone_number_id: str | None = None
    timestamp: datetime
    text: str | None = None
    media: MediaInfo | None = None
    reply_to_id: str | None = None


class ProviderOutboundPayload(BaseModel):
    """A message to send. `template` takes precedence over `text`/`media`."""

    to: str
    text: str | None = None
    media: MediaInput | None = None
    template: TemplateRef | None = None
    reply_to_id: str | None = None