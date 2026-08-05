import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";

import { Reveal } from "@/lib/components/reveal";

export function Cta() {
  return (
    <section className="relative overflow-hidden border-t bg-primary py-20 text-primary-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-white/15 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Recuperá tu tiempo para el trabajo que importa
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Sumate a la lista de espera y enterate primero cuando esté
            disponible.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/sign-up"
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "w-full sm:w-auto",
              )}
            >
              Crear cuenta gratis
              <ArrowRight className="transition-transform group-hover/button:translate-x-0.5" />
            </Link>
            <Link
              href="/auth/sign-in"
              className={cn(
                buttonVariants({
                  size: "lg",
                  variant: "ghost",
                }),
                "w-full text-primary-foreground hover:bg-white/15 hover:text-primary-foreground sm:w-auto",
              )}
            >
              Ya tengo una cuenta
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}