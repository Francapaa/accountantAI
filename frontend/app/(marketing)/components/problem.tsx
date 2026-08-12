import { MessageSquareWarning } from "lucide-react";

import { Reveal } from "@/lib/components/reveal";

import { Marquee } from "./marquee";

const exampleQuestions = [
  "¿Ya puedo facturar?",
  "¿Cuándo vence el monotributo?",
  "¿Tengo que recategorizarme?",
  "¿Cómo hago una nota de crédito?",
  "¿Qué categoría me corresponde?",
  "¿Puedo pagar con débito automático?",
  "¿Qué vence esta semana?",
  "¿Cómo declaro el IVA de servicios?",
];

export function Problem() {
  return (
    <section
      id="problema"
      className="relative overflow-hidden border-y bg-muted/40 py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal scrub>
          <p className="flex items-center gap-2 text-sm font-semibold tracking-wider text-accent uppercase">
            <MessageSquareWarning className="size-4" aria-hidden="true" />
            El problema
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Tu día está lleno de consultas que se repiten
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            En un día promedio, un contador recibe decenas de mensajes de
            WhatsApp con las mismas preguntas. Son consultas rápidas de
            responder, pero interrumpen el trabajo y acumulan horas a la semana.
          </p>
          <p className="mt-4 text-pretty text-muted-foreground">
            La mayoría no agregan valor: solo confirman lo que la normativa ya
            dice. El verdadero trabajo de un contador no es repetir normas, es
            interpretarlas y aconsejar.
          </p>
        </Reveal>

        <Reveal scrub className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background px-4 py-3 shadow-sm">
            <span
              aria-hidden="true"
              className="relative flex size-2 shrink-0"
            >
              <span className="absolute inline-flex size-full animate-ping-soft rounded-full bg-accent/60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent/80" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              Así suenan las consultas de un día laboral…
            </p>
          </div>
          <Marquee
            ariaLabel="Consultas típicas de un estudio contable"
            items={exampleQuestions.map((q, i) => ({ id: `q-${i}`, label: q }))}
          />
          <p className="text-center text-xs text-muted-foreground">
            Y se repiten con cada cliente, todos los días.
          </p>
        </Reveal>
      </div>
    </section>
  );
}