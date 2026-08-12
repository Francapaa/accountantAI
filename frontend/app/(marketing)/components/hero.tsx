import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/lib/components/ui/badge";
import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";

import { HeroVisual } from "./hero-visual";
import { WordStagger } from "./word-stagger";

const HEADLINE_WORDS = [
  "Tu",
  "asistente",
  "de",
  "IA",
  "para",
  "contadores,",
  "respaldado",
  "en",
  "la",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,oklch(0.9_0.03_250),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.94_0.02_235),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/4 -z-10 h-96 w-96 animate-aurora rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-1/5 -z-10 h-80 w-80 animate-aurora rounded-full bg-accent/10 blur-3xl motion-reduce:animate-none"
        style={{ animationDelay: "-7s" }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="text-center lg:text-left">
          <div className="animate-rise-in">
            <Badge variant="secondary" className="gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping-soft rounded-full bg-accent" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              Hecho para estudios contables de Argentina
            </Badge>
          </div>

          <h1 className="mt-6 max-w-3xl text-balance font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <WordStagger>
              {HEADLINE_WORDS.map((word, i) => (
                <span
                  key={`hl-${i}`}
                  data-word
                  className="inline-block whitespace-pre"
                >
                  {i > 0 ? ` ${word}` : word}
                </span>
              ))}
              <span
                data-word
                className="inline-block whitespace-pre bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent animate-sheen motion-reduce:animate-none"
              >
                {" "}normativa de ARCA/AFIP
              </span>
            </WordStagger>
          </h1>
          <p
            className="animate-rise-in mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
            style={{ animationDelay: "120ms" }}
          >
            Respondé en segundos las preguntas repetitivas de tus clientes con
            respuestas citadas a la normativa oficial. Cada consulta queda en la
            carpeta del cliente, con su contexto y su historial.
          </p>

          <div
            className="animate-rise-in mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/auth/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full bg-gradient-to-r from-accent to-[oklch(0.45_0.12_235)] shadow-[0_8px_24px_-8px_rgb(0_0_0_/_0.35)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgb(0_0_0_/_0.4)] sm:w-auto",
              )}
            >
              Crear cuenta gratis
              <ArrowRight className="transition-transform group-hover/button:translate-x-0.5" />
            </Link>
            <Link
              href="#funcionalidades"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "w-full sm:w-auto",
              )}
            >
              Ver funcionalidades
            </Link>
          </div>
        </div>

        <div className="animate-scale-in relative hidden justify-center lg:flex [animation-delay:200ms]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-accent/20 to-transparent blur-2xl"
          />
          <div className="animate-float motion-reduce:animate-none">
            <HeroVisual />
          </div>
          <p className="absolute -bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
            Vista previa orientativa de una consulta
          </p>
        </div>
      </div>
    </section>
  );
}