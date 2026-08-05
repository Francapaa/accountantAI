import { Reveal } from "@/lib/components/reveal";

const exampleQuestions = [
  "¿Ya puedo facturar?",
  "¿Cuándo vence el monotributo?",
  "¿Tengo que recategorizarme?",
  "¿Cómo hago una nota de crédito?",
  "¿Qué categoría me corresponde?",
] as const;

export function Problem() {
  return (
    <section className="border-y bg-muted/40 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">
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
        <div>
          <Reveal>
            <p
              id="consultas-tipicas"
              className="mb-4 text-sm font-medium text-muted-foreground"
            >
              Consultas típicas de un día laboral:
            </p>
          </Reveal>
          <ol aria-labelledby="consultas-tipicas" className="flex flex-col gap-3">
            {exampleQuestions.map((question, i) => (
              <li key={question}>
                <Reveal
                  delay={i * 70}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/10">
                    {i + 1}
                  </span>
                  <p className="font-medium">“{question}”</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}