import { Card, CardContent } from "@/lib/components/ui/card";
import { Reveal } from "@/lib/components/reveal";

import { SectionHeading } from "./section-heading";

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
    <section id="como-funciona" className="relative border-t bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Cómo funciona"
            title="En tres pasos, de la consulta a la respuesta"
          />
        </Reveal>
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((item, i) => (
            <li key={item.step}>
              <Reveal delay={i * 90}>
                <Card className="h-full transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgb(0_0_0/0.3)]">
                  <CardContent className="pt-6">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground ring-4 ring-primary/20">
                      {item.step}
                    </span>
                    <h3 className="mt-5 font-heading text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}