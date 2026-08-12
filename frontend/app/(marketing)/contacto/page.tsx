import type { Metadata } from "next";

import { siteConfig } from "@/lib/config/site";

import { PageShell } from "../components";
import { legalPageMetadata } from "../legal/metadata";

export const metadata: Metadata = legalPageMetadata.contacto;

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: `Contacto — ${siteConfig.name}`,
  url: `${siteConfig.url}/contacto`,
  mainEntity: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: siteConfig.contactEmail,
      areaServed: "AR",
      availableLanguage: ["es"],
    },
  },
};

export default function ContactoPage() {
  return (
    <PageShell>
      <p className="text-sm font-semibold tracking-wider text-primary uppercase">
        Contacto
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        Hablemos
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Escribinos para consultas, soporte o una demo para tu estudio contable.
        Respondemos por email.
      </p>
      <div className="mt-8 rounded-xl border border-border/60 bg-muted/40 p-6">
        <p className="text-sm font-medium text-muted-foreground">Email</p>
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="mt-1 block font-heading text-lg font-semibold text-primary"
        >
          {siteConfig.contactEmail}
        </a>
      </div>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>
          Si sos contador o formás parte de un estudio contable en Argentina,
          contanos tu caso: qué consultas repetitivas te quitan más horas.
        </p>
        <p>
          También podés empezar a probarlo creando una cuenta gratuita desde el
          sitio principal.
        </p>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </PageShell>
  );
}