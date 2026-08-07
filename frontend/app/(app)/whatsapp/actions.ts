"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";

export type ActionState = {
  error?: string | null;
  success?: boolean;
};

async function runBackend(path: string, init?: RequestInit): Promise<ActionState> {
  try {
    await backendFetch(path, init);
    revalidatePath("/home");
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado.";
    return { error: message, success: false };
  }
}

export async function linkWhatsAppConnection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const payload = {
    waba_id: String(formData.get("waba_id") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    phone_number_id: String(formData.get("phone_number_id") ?? "").trim(),
  };

  if (!payload.phone || !payload.waba_id || !payload.phone_number_id) {
    return { error: "Completá el teléfono, el waba_id y el phone_number_id.", success: false };
  }

  return runBackend("/api/whatsapp/connections", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function unlinkWhatsAppConnection(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("connection_id") ?? "");
  if (!id) return;
  await backendFetch(`/api/whatsapp/connections/${id}`, { method: "DELETE" });
  revalidatePath("/home");
}

/**
 * Saves the accountant's reply as a draft. Nothing is sent to WhatsApp.
 */
export async function saveDraft(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const conversation_id = String(formData.get("conversation_id") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const reply_to_message_id = String(formData.get("reply_to_message_id") ?? "") || null;

  if (!conversation_id || !text) {
    return { error: "Escribí una respuesta antes de guardar el borrador.", success: false };
  }

  return runBackend("/api/whatsapp/drafts", {
    method: "POST",
    body: JSON.stringify({ conversation_id, text, reply_to_message_id }),
  });
}

/**
 * Approves (accepts) sending a saved draft to the client via WhatsApp. This is
 * the only step that actually dispatches the message to WhatsApp.
 */
export async function approveDraft(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const draft_id = String(formData.get("draft_id") ?? "").trim();
  if (!draft_id) {
    return { error: "No se identificó el borrador.", success: false };
  }

  return runBackend(`/api/whatsapp/drafts/${draft_id}/approve`, { method: "POST" });
}