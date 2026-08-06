"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createClientSchema } from "./schema";

export type CreateClientState = {
  error?: string | null;
  success?: boolean;
};

export async function createClient(
  _prevState: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  const user = await requireAuth();

  const parsed = createClientSchema.safeParse({
    name: formData.get("name"),
    province: formData.get("province") || undefined,
    tax_regime: formData.get("tax_regime") || undefined,
    activity: formData.get("activity") || undefined,
    notes_public: formData.get("notes_public") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("clients").insert({
    owner_id: user.id,
    name: parsed.data.name,
    province: parsed.data.province ?? null,
    tax_regime: parsed.data.tax_regime ?? null,
    activity: parsed.data.activity ?? null,
    notes_public: parsed.data.notes_public ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/home");
  return { success: true };
}
