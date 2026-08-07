import { cache } from "react";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { BACKEND_URL } from "@/lib/backend";

export type WhatsAppConnection = {
  id: string;
  provider: string;
  waba_id: string;
  phone: string | null;
  phone_number_id: string;
  status: "pending" | "connected" | "error";
};

export type InboxMessage = {
  id: string;
  conversation_id: string;
  content: string;
  created_at: string;
  client_name: string | null;
  status: "received" | "sent";
  draft_id: string | null;
  draft_content: string | null;
};

/** Public webhook URL the accountant must configure once at platform level in Meta. */
export function getWebhookUrl(): string {
  return `${BACKEND_URL}/api/whatsapp/webhook`;
}

/**
 * Lists the current accountant's WhatsApp connections (RLS-scoped).
 */
export const getWhatsAppConnections = cache(async (): Promise<WhatsAppConnection[]> => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("whatsapp_connections")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as WhatsAppConnection[];
});

/**
 * Lists pending inbound WhatsApp messages ("captura para aprobar") together with
 * any saved draft that answers each one, joined through `reply_to_message_id`.
 */
export const getWhatsAppInbox = cache(async (): Promise<InboxMessage[]> => {
  const supabase = getSupabaseServerClient();

  const inbound = supabase
    .from("messages")
    .select(
      "id, content, created_at, status, reply_to_message_id, conversations(id, title, clients(name))",
    )
    .eq("direction", "inbound")
    .eq("status", "received")
    .order("created_at", { ascending: false });

  const drafts = supabase
    .from("messages")
    .select("id, content, reply_to_message_id")
    .eq("direction", "outbound")
    .eq("status", "draft");

  const [{ data: inboundData, error: inboundError }, { data: draftData, error: draftError }] =
    await Promise.all([inbound, drafts]);

  if (inboundError) {
    throw new Error(inboundError.message);
  }
  if (draftError) {
    throw new Error(draftError.message);
  }

  const draftByReplyTo = new Map<string, { id: string; content: string | null }>();
  for (const draft of draftData ?? []) {
    if (draft.reply_to_message_id) {
      draftByReplyTo.set(draft.reply_to_message_id, {
        id: draft.id,
        content: draft.content ?? null,
      });
    }
  }

  return (inboundData ?? []).map((row): InboxMessage => {
    const convo = Array.isArray(row.conversations)
      ? row.conversations[0]
      : row.conversations;
    const draft = draftByReplyTo.get(row.id);

    return {
      id: row.id,
      conversation_id: convo?.id ?? "",
      content: row.content ?? "",
      created_at: row.created_at ?? "",
      client_name:
        (Array.isArray(convo?.clients)
          ? convo.clients[0]?.name
          : (convo?.clients as { name: string } | null)?.name) ??
        convo?.title ??
        null,
      status: row.status ?? "received",
      draft_id: draft?.id ?? null,
      draft_content: draft?.content ?? null,
    };
  });
});