"use client";

import { useActionState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/lib/components/ui/button";
import { Field, Label } from "@/lib/components/ui/field";
import { Input } from "@/lib/components/ui/input";
import { cn } from "@/lib/utils";

import { AuthCard } from "../../components";
import { updatePassword, type UpdatePasswordState } from "../actions";

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState<
    UpdatePasswordState,
    FormData
  >(updatePassword, { error: null });

  return (
    <AuthCard
      icon={<ShieldCheck className="size-5" />}
      title="Nueva contraseña"
      description="Elegí una nueva contraseña para tu cuenta."
    >
      <form action={formAction} className="space-y-5">
        <Field>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            className="h-10"
            required
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

        <Button type="submit" disabled={isPending} className="h-10 w-full">
          {isPending ? (
            <>
              <LoaderCircle className="animate-spin" />
              Guardando…
            </>
          ) : (
            "Guardar contraseña"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}