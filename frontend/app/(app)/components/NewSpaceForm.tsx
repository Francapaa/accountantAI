"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { LoaderCircle, Plus } from "lucide-react";

import { Button } from "@/lib/components/ui/button";
import { Field, Label } from "@/lib/components/ui/field";
import { Input } from "@/lib/components/ui/input";
import { cn } from "@/lib/utils";
import { PROVINCES, TAX_REGIMES } from "@/lib/constants/clients";

import { createClient, type CreateClientState } from "../actions";

export function NewSpaceForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState<CreateClientState, FormData>(
    createClient,
    { error: null },
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <Field>
        <Label htmlFor="name">Nombre del cliente</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ej. Estudio Rodríguez"
          className="h-9"
          autoFocus
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="province">Provincia</Label>
          <select
            id="province"
            name="province"
            defaultValue=""
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Sin especificar</option>
            {PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <Label htmlFor="tax_regime">Régimen fiscal</Label>
          <select
            id="tax_regime"
            name="tax_regime"
            defaultValue=""
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Sin especificar</option>
            {TAX_REGIMES.map((regime) => (
              <option key={regime} value={regime}>
                {regime}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field>
        <Label htmlFor="activity">Actividad / rubro</Label>
        <Input
          id="activity"
          name="activity"
          placeholder="Ej. Comercio, Servicios, Construcción"
          className="h-9"
        />
      </Field>

      <Field>
        <Label htmlFor="notes_public">Notas de contexto</Label>
        <textarea
          id="notes_public"
          name="notes_public"
          rows={3}
          placeholder="Contexto que la IA usará al responder (opcional)."
          className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      {state.error && (
        <div
          role="alert"
          className={cn(
            "animate-shake rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive",
          )}
        >
          {state.error}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="h-9 w-full">
        {isPending ? (
          <>
            <LoaderCircle className="animate-spin" />
            Creando…
          </>
        ) : (
          <>
            <Plus />
            Crear espacio
          </>
        )}
      </Button>
    </form>
  );
}
