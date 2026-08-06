import { z } from "zod";

export const createClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresá el nombre del cliente.")
    .max(120, "El nombre es demasiado largo."),
  province: z.string().trim().max(80, "La provincia es demasiado larga.").optional(),
  tax_regime: z.string().trim().max(40, "El régimen fiscal es demasiado largo.").optional(),
  activity: z.string().trim().max(120, "La actividad es demasiado larga.").optional(),
  notes_public: z.string().trim().max(4000, "Las notas son demasiado largas.").optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
