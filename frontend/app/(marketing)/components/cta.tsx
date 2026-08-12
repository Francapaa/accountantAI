import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/lib/components/reveal";
import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";

export function Cta() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
      {/* Aurora on navy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 animate-aurora rounded-full bg-accent/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-1/5 h-80 w-80 animate-aurora rounded-full bg-accent/15 blur-3xl motion-reduce:animate-none"
        style={{ animationDelay: "-7s" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(0_0_0_/_0.25))]"
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping-soft rounded-full bg-white/60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-white" />
            </span>
            Empezá hoy
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
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
                buttonVariants({
                  size: "lg",
                  variant: "secondary",
                }),
                "w-full bg-white text-primary shadow-[0_8px_24px_-8px_rgb(0_0_0_/_0.5)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgb(0_0_0_/_0.6)] sm:w-auto",
              )}
            >
              Crear cuenta gratis
              <ArrowRight className="transition-transform group-hover/button:translate-x-0.5" />
            </Link>
            <Link
              href="/auth/sign-in"
              className={cn(
                buttonVariants({ size: "lg", variant: "ghost" }),
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