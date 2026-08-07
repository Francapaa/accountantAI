"""Authenticated WhatsApp API endpoints: per-account connections + message send.

These are *our* endpoints (not the Meta WhatsApp API): they let an accountant link or
unlink their WhatsApp Business number and send/approve a reply to a client. See
docs/sdd/010-whatsapp-adapter.md.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.auth import CurrentUser, get_current_user
from app.core.db import get_supabase_client
from app.whatsapp.meta import MetaCloudApiProvider
from app.whatsapp.schemas import ProviderOutboundPayload
from app.whatsapp.service import normalize_phone

router = APIRouter()


class ConnectionCreate(BaseModel):
    waba_id: str = Field(min_length=1)
    phone: str = Field(min_length=1)
    phone_number_id: str = Field(min_length=1)


class SendMessageIn(BaseModel):
    conversation_id: str = Field(min_length=1)
    text: str = Field(min_length=1)


def _to_response(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "provider": row["provider"],
        "waba_id": row["waba_id"],
        "phone": row.get("phone_number"),
        "phone_number_id": row["phone_number_id"],
        "status": row["status"],
    }


@router.get("/api/whatsapp/connections")
def list_connections(user: CurrentUser = Depends(get_current_user)) -> dict[str, Any]:
    """Lists the authenticated accountant's WhatsApp connections."""
    supabase = get_supabase_client()
    res = (
        supabase.table("whatsapp_connections")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at")
        .execute()
    )
    return {"connections": [_to_response(r) for r in (res.data or [])]}


@router.post("/api/whatsapp/connections", status_code=status.HTTP_201_CREATED)
def create_connection(
    payload: ConnectionCreate,
    user: CurrentUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Links a phone number (already provisioned on the platform WABA) to the accountant."""
    supabase = get_supabase_client()
    insert = (
        supabase.table("whatsapp_connections")
        .insert(
            {
                "owner_id": user.id,
                "provider": "meta",
                "waba_id": payload.waba_id,
                "phone_number_id": payload.phone_number_id,
                "phone_number": normalize_phone(payload.phone),
                "status": "pending",
            }
        )
        .execute()
    )
    if not insert.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo enlazar el número de WhatsApp.",
        )
    return _to_response(insert.data[0])


@router.delete("/api/whatsapp/connections/{connection_id}")
def delete_connection(
    connection_id: str,
    user: CurrentUser = Depends(get_current_user),
) -> dict[str, str]:
    """Unlinks the authenticated accountant's WhatsApp connection."""
    supabase = get_supabase_client()
    res = (
        supabase.table("whatsapp_connections")
        .delete()
        .eq("id", connection_id)
        .eq("owner_id", user.id)
        .execute()
    )
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conexión no encontrada.",
        )
    return {"status": "deleted"}


@router.post("/api/whatsapp/messages")
async def send_message(
    payload: SendMessageIn,
    user: CurrentUser = Depends(get_current_user),
) -> dict[str, str]:
    """Approves and sends a reply to a client's conversation via WhatsApp."""
    supabase = get_supabase_client()

    convo = (
        supabase.table("conversations")
        .select("id, client_id")
        .eq("id", payload.conversation_id)
        .eq("owner_id", user.id)
        .limit(1)
        .execute()
    )
    if not convo.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversación no encontrada.",
        )

    client = (
        supabase.table("clients")
        .select("id, phone")
        .eq("id", convo.data[0]["client_id"])
        .limit(1)
        .execute()
    )
    client_phone = client.data[0].get("phone") if client.data else None
    if not client_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El cliente no tiene número de WhatsApp asociado.",
        )

    connection = (
        supabase.table("whatsapp_connections")
        .select("*")
        .eq("owner_id", user.id)
        .limit(1)
        .execute()
    )
    if not connection.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enlazá un WhatsApp para enviar mensajes.",
        )
    conn = connection.data[0]

    provider = MetaCloudApiProvider()
    try:
        provider_message_id = await provider.send_message(
            ProviderOutboundPayload(to=normalize_phone(client_phone), text=payload.text),
            phone_number_id=conn["phone_number_id"],
        )
    finally:
        await provider.aclose()

    res = (
        supabase.table("messages")
        .insert(
            {
                "conversation_id": payload.conversation_id,
                "role": "assistant",
                "content": payload.text,
                "provider": "meta",
                "provider_message_id": provider_message_id,
                "direction": "outbound",
                "status": "sent",
            }
        )
        .execute()
    )

    return {"status": "sent", "message_id": res.data[0]["id"] if res.data else ""}