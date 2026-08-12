import { Card, CardContent } from "@/lib/components/ui/card";
import { Reveal } from "@/lib/components/reveal";

import { SectionHeading } from "./section-heading";
import { Stagger } from "./stagger-in";

const steps = [
  {
    step: "1",
    title: "Cargá tu lista de clientes",
    description:
      "Creá una carpeta por cliente y cargá su contexto: régimen, provincia, rubro y notas. La IA lo usa en cada respuesta.",
  },
  {
    step: "2",
    title: "Hacé tu consulta",
    description:
      "Preguntale lo mismo que te pregunta tu cliente por WhatsApp. AccountantAI busca en la normativa oficial indexada de ARCA/AFIP.",
  },
  {
    step: "3",
    title: "Verificá y respondé",
    description:
      "Revisá la respuesta y su cita a la normativa, personalizala si querés y reenviátela a tu cliente. Todo queda registrado.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative overflow-hidden border-t bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Cómo funciona"
            title="En tres pasos, de la consulta a la respuesta"
          />
        </Reveal>
        <Stagger
          drawLine
          stagger={0.12}
          className="relative mt-14 grid gap-5 md:grid-cols-3"
        >
          <div
            data-draw-line
            aria-hidden="true"
            className="absolute top-5 right-[16.6%] left-[16.6%] hidden h-px origin-left bg-gradient-to-r from-transparent via-accent/40 to-transparent md:block"
          />
          {steps.map((item) => (
            <li key={item.step} className="relative">
              <Card className="h-full transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-24px_rgb(3_105_161_/_0.35)]">
                <CardContent className="pt-6">
                  <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[oklch(0.45_0.12_235)] font-heading text-lg font-bold text-accent-foreground shadow-[0_4px_12px_-4px_rgb(0_0_0_/_0.3)] ring-4 ring-accent/15">
                    {item.step}
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </Stagger>
      </div>
    </section>
  );
}