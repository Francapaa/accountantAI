"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, LogIn } from "lucide-react";

import { Button } from "@/lib/components/ui/button";
import { Field, Label } from "@/lib/components/ui/field";
import { Input } from "@/lib/components/ui/input";
import { cn } from "@/lib/utils";

import { AuthCard } from "../../components";
import { signIn, type SignInState } from "../actions";

export function SignInForm() {
  const [state, formAction, isPending] = useActionState<SignInState, FormData>(
    signIn,
    { error: null },
  );

  return (
    <AuthCard
      icon={<LogIn className="size-5" />}
      title="Iniciar sesión"
      description="Ingresá a tu cuenta para acceder a tus clientes."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Registrate
          </Link>
        </p>
      }
    >
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
        <Field>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
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
              Ingresando…
            </>
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="transition-transform group-hover/button:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </AuthCard>
  );
}