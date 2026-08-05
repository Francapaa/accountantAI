import { LogOut } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { signOut } from "@/lib/actions";
import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/app/(marketing)/components/logo";

type Me = { user_id: string; email?: string };

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await requireAuth();

  let me: Me | null = null;
  let backendError: string | null = null;
  try {
    me = await backendFetch<Me>("/api/me");
  } catch (e) {
    backendError = e instanceof Error ? e.message : "Error de conexión";
  }

  const name =
    typeof user.user_metadata.name === "string" && user.user_metadata.name
      ? user.user_metadata.name
      : "";

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <form action={signOut}>
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
              )}
            >
              <LogOut />
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 sm:px-6">
        <div className="animate-rise-in">
          <p className="text-sm font-medium text-primary">Dashboard</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Hola{name ? `, ${name}` : ""}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tu espacio de trabajo de clientes llegará pronto.
          </p>
        </div>

        <div className="animate-fade-in mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm">
            <p className="font-heading text-2xl font-semibold">—</p>
            <p className="mt-1 text-sm text-muted-foreground">Clientes</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm">
            <p className="font-heading text-2xl font-semibold">—</p>
            <p className="mt-1 text-sm text-muted-foreground">Consultas</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm">
            <p className="font-heading text-2xl font-semibold">—</p>
            <p className="mt-1 text-sm text-muted-foreground">Estado</p>
          </div>
        </div>

        <div className="animate-fade-in mt-4 rounded-2xl border border-border/60 bg-card/80 p-6 text-sm backdrop-blur-sm">
          <p className="font-medium text-foreground">Sesión verificada</p>
          <p className="mt-1 text-muted-foreground">
            {me ? (
              <>
                Tu token JWT es válido ante el backend{" "}
                <span className="font-medium text-emerald-600">
                  ({me.user_id.slice(0, 8)}…)
                </span>
                .
              </>
            ) : backendError ? (
              <>
                El backend no respondió:{" "}
                <span className="font-medium text-destructive">
                  {backendError}
                </span>
              </>
            ) : null}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      </main>
    </div>
  );
}