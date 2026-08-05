export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  keywords: string[];
  url: string;
  locale: string;
  contactEmail: string;
  ogImage: string;
};

export const siteConfig: SiteConfig = {
  name: "AccountantAI",
  tagline: "Asistente de IA para contadores",
  description:
    "AccountantAI es un asistente de IA para estudios contables que responde con respaldo en normativa oficial de ARCA/AFIP, con citas verificables y una carpeta de historial por cliente.",
  keywords: [
    "asistente de IA para contadores",
    "chatbot para contadores",
    "IA para estudios contables",
    "normativa ARCA",
    "normativa AFIP",
    "chatbot RAG",
    "respuestas con citas a normativa",
    "monotributo IA",
    "recategorizacion monotributo",
    "facturacion electronica",
    "inteligencia artificial contable",
    "software para contadores",
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://accountantai.com",
  locale: "es_AR",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@accountantai.com",
  ogImage: "/opengraph-image.png",
};