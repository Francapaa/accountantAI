import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/lib/components/ui/badge";
import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
  { value: "48 h", label: "Ahorradas por semana en consultas repetitivas" },
  { value: "100%", label: "Respuestas con cita a la normativa" },
  { value: "1", label: "Carpeta por cliente con su historial" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,oklch(0.95_0.03_255),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.94_0.02_220),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
        <div className="animate-rise-in">
          <Badge variant="secondary" className="mb-6">
            Hecho para estudios contables de Argentina
          </Badge>
        </div>
        <h1
          className="animate-rise-in max-w-3xl text-balance font-heading text-4xl font-bold tracking-tight sm:text-6xl"
          style={{ animationDelay: "60ms" }}
        >
          Tu asistente de IA para contadores, respaldado en la{" "}
          <span className="text-primary">normativa de ARCA/AFIP</span>
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
          className="animate-rise-in mt-10 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "180ms" }}
        >
          <Link
            href="/auth/sign-up"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
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
        <dl
          className="animate-rise-in mt-16 grid w-full max-w-3xl grid-cols-1 gap-8 border-t pt-8 sm:grid-cols-3"
          style={{ animationDelay: "240ms" }}
        >
          {highlights.map((item) => (
            <div key={item.label}>
              <dt className="sr-only">{item.label}</dt>
              <dd className="text-3xl font-bold text-primary">{item.value}</dd>
              <dd className="mt-1 text-sm text-muted-foreground">{item.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}