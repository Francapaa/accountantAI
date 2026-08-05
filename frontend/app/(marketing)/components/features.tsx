import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Reveal } from "@/lib/components/reveal";
import {
  BookOpenCheck,
  Building2,
  FolderOpen,
  History,
  Lightbulb,
  Search,
} from "lucide-react";

import { SectionHeading } from "./section-heading";

const features = [
  {
    icon: BookOpenCheck,
    title: "RAG con normativa oficial",
    description:
      "Respuestas generadas a partir de documentos oficiales de ARCA/AFIP indexados y vectorizados: monotributo, facturación, recategorización y más.",
  },
  {
    icon: Search,
    title: "Citas a la normativa",
    description:
      "Cada respuesta indica el documento usado y su fuente. Verificá la base legal antes de enviarla a tu cliente, sin dudas.",
  },
  {
    icon: FolderOpen,
    title: "Carpeta por cliente",
    description:
      "Todo el historial de consultas de cada cliente en un solo lugar. Sabés siempre qué le respondiste y cuándo.",
  },
  {
    icon: Building2,
    title: "Contexto persistente",
    description:
      "La IA recuerda si el cliente es monotributista, en qué provincia opera y a qué se dedica. Respuestas pensadas para su caso real.",
  },
  {
    icon: History,
    title: "Historial completo por cliente",
    description:
      "Todas las conversaciones quedan guardadas. “¿Qué le respondimos a Juan sobre facturación al exterior?” se responde con un clic.",
  },
  {
    icon: Lightbulb,
    title: "Resúmenes y notas internas",
    description:
      "Resúmenes automáticos de las consultas del mes por cliente y notas internas del estudio que la IA también usa como contexto.",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Funcionalidades"
            title="Todo lo que un contador necesita para dejar de repetir"
            description="Una herramienta pensada para el trabajo real de un estudio contable en Argentina."
          />
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 60}>
              <Card className="h-full transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-border hover:shadow-[0_24px_50px_-24px_rgb(0_0_0/0.3)]">
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
                    <feature.icon className="size-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="font-heading text-lg">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}