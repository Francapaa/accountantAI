"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { LoaderCircle, MessageSquarePlus } from "lucide-react";

import { Button } from "@/lib/components/ui/button";
import { Field, Label, FieldHint } from "@/lib/components/ui/field";
import { Input } from "@/lib/components/ui/input";
import { cn } from "@/lib/utils";

import { linkWhatsAppConnection, type ActionState } from "../../whatsapp/actions";

export function WhatsAppLinkForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    linkWhatsAppConnection,
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
        <Label htmlFor="phone">Número de WhatsApp</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="Ej. +54 9 11 5555-3333"
          className="h-9"
          autoFocus
          required
        />
      </Field>

      <Field>
        <Label htmlFor="phone_number_id">phone_number_id</Label>
        <Input id="phone_number_id" name="phone_number_id" placeholder="Ej. 1225021210" className="h-9" required />
      </Field>

      <Field>
        <Label htmlFor="waba_id">waba_id (Business Account)</Label>
        <Input id="waba_id" name="waba_id" placeholder="El id lo asigna la plataforma" className="h-9" required />
        <FieldHint>Estos datos los provée la plataforma al dar de alta tu número en la WABA.</FieldHint>
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
        {isPending ? <LoaderCircle className="animate-spin" /> : <MessageSquarePlus />}
        Enlazar número
      </Button>
    </form>
  );
}