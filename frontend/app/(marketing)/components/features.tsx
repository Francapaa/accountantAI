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
import { Stagger } from "./stagger-in";

const features = [
  {
    icon: BookOpenCheck,
    title: "Basado en normativa oficial",
    description:
      "Respuestas generadas a partir de documentos oficiales de ARCA/AFIP: monotributo, facturación, recategorización y más.",
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
    <section
      id="funcionalidades"
      className="relative overflow-hidden py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.03_250),transparent_60%)]"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Funcionalidades"
            title="Todo lo que un contador necesita para dejar de repetir"
            description="Una herramienta pensada para el trabajo real de un estudio contable en Argentina."
          />
        </Reveal>
        <Stagger
          from="center"
          stagger={0.09}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <Card key={feature.title} className="group h-full transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-24px_rgb(3_105_161_/_0.35)]">
              <CardHeader>
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 text-accent ring-1 ring-accent/15 transition-transform duration-200 ease-out group-hover:scale-105">
                  <feature.icon className="size-6" aria-hidden="true" />
                </div>
                <CardTitle className="font-heading text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </Stagger>
      </div>
    </section>
  );
}