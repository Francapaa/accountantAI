import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/lib/config/site";

import { PageShell } from "../components";
import { legalPageMetadata } from "../legal/metadata";

export const metadata: Metadata = legalPageMetadata.acerca;

const sections = [
  {
    heading: "El problema que resolvemos",
    body: [
      "En un día promedio, un contador recibe decenas de consultas por WhatsApp que se repiten con cada cliente: vencimientos, categorías de monotributo, facturación. Responder bien exige buscar y corroborar la normativa vigente, y eso consume horas que podrían dedicarse a interpretar y aconsejar.",
    ],
  },
  {
    heading: "Cómo lo resolvemos",
    body: [
      "AccountantAI es un asistente de inteligencia artificial para estudios contables de Argentina. Así como plantea una consulta, responde en segundos con respaldo en la normativa oficial indexada de ARCA/AFIP y muestra la cita al documento que usó. Cada contador tiene una carpeta por cliente con su contexto (régimen, provincia, actividad) y el historial de consultas.",
    ],
  },
  {
    heading: "Por qué confiar en las respuestas",
    body: [
      "Cada respuesta que usa normativa enlaza la fuente oficial para que la abras y la verifiqués antes de compartirla. La herramienta estructura la base legal; la decisión y la firma siempre son del contador. El acceso se protege con autenticación y permisos a nivel de fila: cada contador ve solo sus propios clientes.",
    ],
  },
];

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: `Acerca de ${siteConfig.name}`,
  url: `${siteConfig.url}/acerca`,
  description: siteConfig.description,
  mainEntity: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.contactEmail,
    logo: { "@type": "ImageObject", url: `${siteConfig.url}/icon.svg` },
  },
};

export default function AcercaPage() {
  return (
    <PageShell>
      <p className="text-sm font-semibold tracking-wider text-primary uppercase">
        Acerca
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {siteConfig.name} es un asistente de IA para estudios contables de
        Argentina
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Responde consultas tributarias con respaldo en la normativa oficial de
        ARCA/AFIP, con la cita a la fuente y una carpeta de historial por
        cliente.
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
      <p className="mt-10">
        <Link
          href="/contacto"
          className="text-primary underline underline-offset-4"
        >
          Contactanos
        </Link>{" "}
        o conocé más en el{" "}
        <Link href="/blog" className="text-primary underline underline-offset-4">
          blog
        </Link>
        .
      </p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </PageShell>
  );
}