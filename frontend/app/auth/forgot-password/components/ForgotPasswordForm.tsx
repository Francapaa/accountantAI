"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, LoaderCircle } from "lucide-react";

import { Button } from "@/lib/components/ui/button";
import { Field, Label } from "@/lib/components/ui/field";
import { Input } from "@/lib/components/ui/input";
import { cn } from "@/lib/utils";

import { AuthCard } from "../../components";
import { resetPassword, type ResetPasswordState } from "../actions";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetPassword, { message: null, error: null });

  const hasMessage = Boolean(state.message);
  const hasError = Boolean(state.error);

  return (
    <AuthCard
      icon={<KeyRound className="size-5" />}
      title="Restablecer contraseña"
      description={
        hasMessage
          ? "Revisá tu bandeja de entrada."
          : "Ingresá tu email y te enviamos un link para restablecerla."
      }
      footer={
        <Link
          href="/auth/sign-in"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="size-4" />
          Volver a iniciar sesión
        </Link>
      }
    >
      {hasMessage ? (
        <div
          role="status"
          className="animate-fade-in rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
        >
          {state.message}
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="contador@estudio.com.ar"
              className="h-10"
              required
            />
          </Field>

          {hasError && (
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
                Enviando…
              </>
            ) : (
              "Enviar enlace"
            )}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}