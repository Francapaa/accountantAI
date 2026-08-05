import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingresá tu nombre (mínimo 2 caracteres).")
    .max(80, "El nombre es demasiado largo."),
  email: z.string().trim().email("Ingresá un email válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;