import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import {
  BookOpenCheck,
  Building2,
  FolderOpen,
  History,
  Lightbulb,
  Search,
} from "lucide-react";

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
    <section id="funcionalidades" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Funcionalidades
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Todo lo que un contador necesita para dejar de repetir
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Una herramienta pensada para el trabajo real de un estudio contable
            en Argentina.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
          ))}
        </div>
      </div>
    </section>
  );
}
