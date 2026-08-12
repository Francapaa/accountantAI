import type { Metadata } from "next";

export const authPageMetadata = {
  signIn: {
    title: "Iniciar sesión",
    description:
      "Accedé a tu cuenta de AccountantAI para responder consultas tributarias con cita a la normativa de ARCA/AFIP.",
  },
  signUp: {
    title: "Crear cuenta",
    description:
      "Creá tu cuenta gratis de AccountantAI y empezá a responder consultas de tus clientes con cita a la normativa oficial.",
  },
  forgotPassword: {
    title: "Recuperar contraseña",
    description:
      "Pedí un link para restablecer la contraseña de tu cuenta de AccountantAI.",
  },
  updatePassword: {
    title: "Actualizar contraseña",
    description:
      "Definí una nueva contraseña para tu cuenta de AccountantAI.",
  },
  checkEmail: {
    title: "Revisá tu email",
    description:
      "Confirmá tu cuenta de AccountantAI desde el link que te enviamos por email.",
  },
  authCodeError: {
    title: "El enlace no es válido",
    description:
      "El enlace que usaste es inválido o ya expiró. Volvé a iniciar sesión en AccountantAI.",
  },
} as const satisfies Record<string, Metadata>;