"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "./schema";

export type ResetPasswordState = {
  message?: string | null;
  error?: string | null;
};

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    message:
      "Si el email está registrado, te enviamos un link para restablecer tu contraseña.",
  };
}