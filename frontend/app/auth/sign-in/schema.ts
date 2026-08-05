import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export type SignInInput = z.infer<typeof signInSchema>;