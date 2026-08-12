import { Reveal } from "@/lib/components/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/lib/components/ui/accordion";

import { SectionHeading } from "./section-heading";

export const faqItems = [
  {
    question: "¿Qué es AccountantAI?",
    answer:
      "Es un asistente de inteligencia artificial diseñado para estudios contables de Argentina. Responde consultas tributarias con respaldo en la normativa oficial de ARCA/AFIP, mostrando siempre la cita al documento usado.",
  },
  {
    question: "¿De dónde sale la normativa que utiliza?",
    answer:
      "De documentos oficiales de ARCA/AFIP: leyes, resoluciones, manuales e instructivos. Se indexan, vectorizan y se mantienen actualizados automáticamente.",
  },
  {
    question: "¿AccountantAI reemplaza al contador?",
    answer:
      "No. Está pensado como un asistente del contador: prepara respuestas con su base legal para que el profesional verifique y decida. La recomendación final siempre es humana.",
  },
  {
    question: "¿Puedo verificar las respuestas?",
    answer:
      "Sí. Cada respuesta que usa normativa incluye la cita al documento y su fuente. Podés abrir el enlace y comprobar el texto antes de compartirlo con tu cliente.",
  },
  {
    question: "¿Sirve para monotributistas y responsables inscriptos?",
    answer:
      "Sí. La IA usa el contexto de cada cliente (régimen, provincia, actividad) para dar respuestas acordes a su situación particular.",
  },
  {
    question: "¿Qué pasa con la privacidad de mis clientes?",
    answer:
      "Cada contador accede únicamente a sus propios clientes y conversaciones. El acceso se protege con autenticación y permisos a nivel de fila en la base de datos.",
  },
] as const;

export function Faq() {
  return (
    <section id="preguntas-frecuentes" className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Lo que querés saber antes de empezar"
          />
        </Reveal>
        <Reveal delay={100}>
          <Accordion
            multiple
            defaultValue={faqItems.map((_, index) => `item-${index}`)}
            className="mt-10"
          >
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}