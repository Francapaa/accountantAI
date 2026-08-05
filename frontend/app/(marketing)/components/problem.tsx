const exampleQuestions = [
  "¿Ya puedo facturar?",
  "¿Cuándo vence el monotributo?",
  "¿Tengo que recategorizarme?",
  "¿Cómo hago una nota de crédito?",
  "¿Qué categoría me corresponde?",
] as const;

export function Problem() {
  return (
    <section className="border-y bg-muted/40 py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            El problema
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
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
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            Consultas típicas de un día laboral:
          </p>
          {exampleQuestions.map((question, i) => (
            <div
              key={question}
              className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-sm"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <p className="font-medium">“{question}”</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
