import type { Metadata } from "next";

import { siteConfig } from "@/lib/config/site";

import { PageShell } from "../components";
import { legalPageMetadata } from "../legal/metadata";

export const metadata: Metadata = legalPageMetadata.terminos;

const sections = [
  {
    heading: "El servicio",
    body: [
      "AccountantAI es un asistente de inteligencia artificial para contadores y estudios contables de Argentina. Responde consultas tributarias generadas sobre la normativa pública de ARCA/AFIP, mostrando la cita al documento usado en cada respuesta.",
    ],
  },
  {
    heading: "Responsabilidad del profesional",
    body: [
      "Las respuestas del asistente son herramientas de trabajo, no opiniones legales ni fiscales ni reemplazan el criterio profesional. Vos sos responsable de verificar cada respuesta contra la fuente oficial antes de compartirla con un cliente. El asistente no firma nada por vos.",
    ],
  },
  {
    heading: "Uso aceptable",
    body: [
      "El servicio es para uso profesional. No podés usarlo para procesar datos de clientes sin su consentimiento, revender su capacidad sin autorización o realizar cualquier uso no permitido por la ley argentina.",
    ],
  },
  {
    heading: "Disponibilidad y cambios",
    body: [
      "El servicio se ofrece tal cual, sin garantías de disponibilidad continua. Podemos modificar estos términos que informaremos por los canales del producto; el uso continuado implica su aceptación.",
    ],
  },
];

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: `Términos y condiciones — ${siteConfig.name}`,
  url: `${siteConfig.url}/terminos`,
  description: legalPageMetadata.terminos.description,
  inLanguage: "es-AR",
  isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
};

export default function TerminosPage() {
  return (
    <PageShell>
      <p className="text-sm font-semibold tracking-wider text-primary uppercase">
        Legales
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        Términos y condiciones
      </h1>
      <p className="mt-4 text-muted-foreground">
        Al usar AccountantAI aceptás estos términos. Si tenés dudas, escribinos
        a {siteConfig.contactEmail}.
      </p>
      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-2xl font-semibold">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-4">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </PageShell>
  );
}