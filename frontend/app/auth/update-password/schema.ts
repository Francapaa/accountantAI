import { z } from "zod";

export const updatePasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;