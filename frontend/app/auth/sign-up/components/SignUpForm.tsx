"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, UserPlus } from "lucide-react";

import { Button } from "@/lib/components/ui/button";
import { Field, Label } from "@/lib/components/ui/field";
import { Input } from "@/lib/components/ui/input";
import { cn } from "@/lib/utils";

import { AuthCard } from "../../components";
import { signUp, type SignUpState } from "../actions";

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<SignUpState, FormData>(
    signUp,
    { error: null },
  );

  return (
    <AuthCard
      icon={<UserPlus className="size-5" />}
      title="Creá tu cuenta"
      description="Empezá a usar AccountantAI en minutos."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/auth/sign-in"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Iniciá sesión
          </Link>
        </p>
      }
    >
      <form action={formAction} className="space-y-5">
        <Field>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            className="h-10"
            required
          />
        </Field>
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
              Creando cuenta…
            </>
          ) : (
            <>
              Registrarme
              <ArrowRight className="transition-transform group-hover/button:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </AuthCard>
  );
}