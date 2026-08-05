import { z } from "zod";

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido."),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;