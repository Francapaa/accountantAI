"""Authenticated WhatsApp API endpoints: per-account connections + draft/approve flow.

These are *our* endpoints (not the Meta WhatsApp API): they let an accountant link or
unlink their WhatsApp Business number and run the capture → draft → **approve** flow. The
reply is never sent to Meta unless the accountant explicitly approves the draft. See
docs/sdd/010-whatsapp-adapter.md.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.auth import CurrentUser, get_current_user
from app.core.db import get_supabase_client
from app.whatsapp.meta import MetaCloudApiProvider
from app.whatsapp.schemas import DraftCreate, ProviderOutboundPayload
from app.whatsapp.service import normalize_phone

router = APIRouter()


class ConnectionCreate(BaseModel):
    waba_id: str = Field(min_length=1)
    phone: str = Field(min_length=1)
    phone_number_id: str = Field(min_length=1)


def _to_response(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "provider": row["provider"],
        "waba_id": row["waba_id"],
        "phone": row.get("phone_number"),
        "phone_number_id": row["phone_number_id"],
        "status": row["status"],
    }


def _conversation(supabase, conversation_id: str, user: CurrentUser) -> dict[str, Any]:
    convo = (
        supabase.table("conversations")
        .select("id, client_id")
        .eq("id", conversation_id)
        .eq("owner_id", user.id)
        .limit(1)
        .execute()
    )
    if not convo.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversación no encontrada.",
        )
    return convo.data[0]


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


@router.post("/api/whatsapp/drafts", status_code=status.HTTP_201_CREATED)
def save_draft(
    payload: DraftCreate,
    user: CurrentUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Persists an outbound reply as a draft. Nothing is sent to WhatsApp."""
    supabase = get_supabase_client()
    _conversation(supabase, payload.conversation_id, user)

    res = (
        supabase.table("messages")
        .insert(
            {
                "conversation_id": payload.conversation_id,
                "role": "assistant",
                "content": payload.text,
                "provider": "meta",
                "direction": "outbound",
                "status": "draft",
                "reply_to_message_id": payload.reply_to_message_id,
            }
        )
        .execute()
    )
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo guardar el borrador.",
        )
    row = res.data[0]
    return {"id": row["id"], "conversation_id": row["conversation_id"], "status": "draft"}


@router.post("/api/whatsapp/drafts/{draft_id}/approve")
async def approve_draft(
    draft_id: str,
    user: CurrentUser = Depends(get_current_user),
) -> dict[str, str]:
    """Approves and sends a saved draft to the client via WhatsApp.

    This is the explicit acceptance step: only this endpoint calls the provider.
    """
    supabase = get_supabase_client()

    draft = (
        supabase.table("messages")
        .select("*")
        .eq("id", draft_id)
        .eq("direction", "outbound")
        .eq("status", "draft")
        .limit(1)
        .execute()
    )
    if not draft.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrador no encontrado.",
        )
    draft_row = draft.data[0]

    convo = _conversation(supabase, draft_row["conversation_id"], user)

    client = (
        supabase.table("clients")
        .select("id, phone")
        .eq("id", convo["client_id"])
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
            ProviderOutboundPayload(to=normalize_phone(client_phone), text=draft_row["content"]),
            phone_number_id=conn["phone_number_id"],
        )
    finally:
        await provider.aclose()

    supabase.table("messages").update(
        {"status": "sent", "provider_message_id": provider_message_id}
    ).eq("id", draft_id).execute()

    reply_to = draft_row.get("reply_to_message_id")
    if reply_to:
        supabase.table("messages").update({"status": "sent"}).eq(
            "id", reply_to
        ).execute()

    return {"status": "sent", "message_id": draft_id}