import type { Metadata } from "next";

import { siteConfig } from "@/lib/config/site";

import { PageShell } from "../components";
import { legalPageMetadata } from "../legal/metadata";

export const metadata: Metadata = legalPageMetadata.privacidad;

const sections = [
  {
    heading: "Qué datos tratamos",
    body: [
      "Para que el asistente funcione, tratamos los datos de tu cuenta (email y nombre), los clientes que registrás en tu estudio y las consultas e historial de cada conversación. También la normativa pública de ARCA/AFIP, que usamos como base de conocimiento común.",
    ],
  },
  {
    heading: "Cómo los protegemos",
    body: [
      "Cada contador accede únicamente a sus propios clientes y conversaciones, protegido por autenticación y permisos a nivel de fila en la base de datos. No compartimos tus datos con terceros ni los vendemos. Solo el equipo de la plataforma puede operar sobre la infraestructura.",
    ],
  },
  {
    heading: "Analítica y cookies",
    body: [
      "Usamos una sesión autenticada (cookie de sesión) para mantener tu acceso. Para entender cómo se usa el sitio, utilizamos una analítica respetuosa de la privacidad de tipo Plausible, que no usa cookies de seguimiento de terceros ni identifica a personas individuales.",
    ],
  },
  {
    heading: "Tus derechos",
    body: [
      "Podés pedirnos acceso, rectificación o eliminación de tus datos escribiéndonos al email de contacto. Eliminar tu cuenta implica que el historial de tus clientes deje de estar disponible.",
    ],
  },
];

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: `Privacidad — ${siteConfig.name}`,
  url: `${siteConfig.url}/privacidad`,
  description: legalPageMetadata.privacidad.description,
  inLanguage: "es-AR",
  isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
};

export default function PrivacidadPage() {
  return (
    <PageShell>
      <p className="text-sm font-semibold tracking-wider text-primary uppercase">
        Legales
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        Política de privacidad
      </h1>
      <p className="mt-4 text-muted-foreground">
        Última actualización: {new Date().toLocaleDateString("es-AR")}.
        AccountantAI es un asistente para profesionales; respetamos la
        confidencialidad de tus datos y los de tus clientes.
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