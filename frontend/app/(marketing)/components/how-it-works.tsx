import { Card, CardContent } from "@/lib/components/ui/card";

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
    <section id="como-funciona" className="border-t bg-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Cómo funciona
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            En tres pasos, de la consulta a la respuesta
          </h2>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((item) => (
            <li key={item.step}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
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
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
