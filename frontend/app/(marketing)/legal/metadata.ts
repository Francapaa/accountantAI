import type { Metadata } from "next";

export const legalPageMetadata = {
  acerca: {
    title: "Acerca",
    description:
      "AccountantAI es un asistente de IA para estudios contables de Argentina: respuestas a consultas tributarias con cita a la normativa oficial de ARCA/AFIP y una carpeta de historial por cliente.",
  },
  contacto: {
    title: "Contacto",
    description:
      "Contactate con el equipo de AccountantAI: consultas, soporte y demos para estudios contables de Argentina.",
  },
  privacidad: {
    title: "Privacidad",
    description:
      "Política de privacidad de AccountantAI: cómo tratamos tus datos y los de tus clientes, aislamiento por contador y uso de normativa pública de ARCA/AFIP.",
  },
  terminos: {
    title: "Términos y condiciones",
    description:
      "Términos y condiciones de uso de AccountantAI: asistente para profesionales, responsabilidad del contador y verificación obligatoria de las respuestas.",
  },
} as const satisfies Record<string, Metadata>;