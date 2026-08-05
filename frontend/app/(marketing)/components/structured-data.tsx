import { siteConfig } from "@/lib/config/site";
import { faqItems } from "./faq";

export function StructuredData() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.contactEmail,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/icon.svg`,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: siteConfig.contactEmail,
      areaServed: "AR",
      availableLanguage: ["es"],
    },
  };

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "es-AR",
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Cómo usar AccountantAI",
    description:
      "En tres pasos, de la consulta a la respuesta citada en la normativa de ARCA/AFIP.",
    step: [
      {
        "@type": "HowToStep",
        name: "Cargá tu lista de clientes",
        text: "Creás una carpeta por cliente y cargás su contexto: régimen, provincia, rubro y notas.",
      },
      {
        "@type": "HowToStep",
        name: "Hacé tu consulta",
        text:
          "Preguntás lo mismo que te pregunta tu cliente. AccountantAI busca en la normativa oficial indexada de ARCA/AFIP.",
      },
      {
        "@type": "HowToStep",
        name: "Verificá y respondé",
        text:
          "Revisás la respuesta y su cita a la normativa, la personalizás si querés y se la reenviás a tu cliente.",
      },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const schemas = [org, softwareApplication, howTo, faq] as const;

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@type"] as string}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
