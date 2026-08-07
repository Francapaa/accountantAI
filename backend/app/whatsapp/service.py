"""Webhook routing + persistence for inbound WhatsApp messages.

Connects the transport (`meta.py`) to the domain: determines which accountant owns
the receiving number (`phone_number_id`), matches the sender (`wa_id`) to a client by
phone, and persists the message with `direction='inbound'` / `status='received'` so it
can be approved and replied to later.
"""

from __future__ import annotations

import re

from supabase import Client

from app.whatsapp.schemas import ProviderInboundMessage

_DIGITS = re.compile(r"\D")


def normalize_phone(value: str) -> str:
    """E.164-ish normalizer: keeps only digits, so matching is robust to `+`, spaces, dashes."""
    return _DIGITS.sub("", value or "")


def _connection_owner(supabase: Client, phone_number_id: str) -> str | None:
    """Returns the profiles.id that owns the phone number, or None if unlinked."""
    if not phone_number_id:
        return None
    res = (
        supabase.table("whatsapp_connections")
        .select("owner_id")
        .eq("phone_number_id", phone_number_id)
        .limit(1)
        .execute()
    )
    return res.data[0]["owner_id"] if res.data else None


def _already_ingested(supabase: Client, provider_message_id: str) -> bool:
    """Dedup guard: a provider_message_id may be re-delivered by Meta on retries."""
    res = (
        supabase.table("messages")
        .select("id")
        .eq("provider_message_id", provider_message_id)
        .limit(1)
        .execute()
    )
    return bool(res.data)


def _find_or_create_conversation(
    supabase: Client, owner_id: str, wa_id: str
) -> str | None:
    """Matches the sender to an existing client workspace, or creates a placeholder.

    Returns the conversation_id, or None if the inbound message cannot be routed.
    A placeholder client (named with the normalized phone) is created so no inbound
    message is lost; the accountant can rename/assign it later.
    """
    phones = [normalize_phone(wa_id)]
    matched: str | None = None
    res_full = (
        supabase.table("clients")
        .select("id, phone")
        .eq("owner_id", owner_id)
        .execute()
    )
    for row in res_full.data or []:
        if row.get("phone") and normalize_phone(row["phone"]) in phones:
            matched = row["id"]
            break

    if matched:
        convo = (
            supabase.table("conversations")
            .select("id")
            .eq("client_id", matched)
            .eq("owner_id", owner_id)
            .limit(1)
            .execute()
        )
        if convo.data:
            return convo.data[0]["id"]
        insert = (
            supabase.table("conversations")
            .insert({"client_id": matched, "owner_id": owner_id})
            .execute()
        )
        return insert.data[0]["id"] if insert.data else None

    client = (
        supabase.table("clients")
        .insert({"owner_id": owner_id, "name": wa_id, "phone": wa_id})
        .execute()
    )
    if not client.data:
        return None
    convo = (
        supabase.table("conversations")
        .insert({"client_id": client.data[0]["id"], "owner_id": owner_id})
        .execute()
    )
    return convo.data[0]["id"] if convo.data else None


def ingest_inbound(supabase: Client, message: ProviderInboundMessage) -> bool:
    """Persists one inbound message. Returns True if a message was created."""
    if not message.phone_number_id:
        return False
    if _already_ingested(supabase, message.provider_message_id):
        return False

    owner_id = _connection_owner(supabase, message.phone_number_id)
    if not owner_id:
        return False

    conversation_id = _find_or_create_conversation(supabase, owner_id, message.wa_id)
    if not conversation_id:
        return False

    content = message.text
    if not content and message.media:
        content = f"[{message.media.type} adjunto]"

    row = {
        "conversation_id": conversation_id,
        "role": "user",
        "content": content,
        "provider": message.provider,
        "provider_message_id": message.provider_message_id,
        "direction": "inbound",
        "status": "received",
        "created_at": message.timestamp.isoformat() if message.timestamp else None,
    }
    res = supabase.table("messages").insert(row).execute()
    return bool(res.data)