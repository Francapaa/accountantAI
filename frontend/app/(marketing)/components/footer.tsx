import Link from "next/link";

import { siteConfig } from "@/lib/config/site";
import { Logo } from "@/lib/components/logo";

const footerLinks = [
  { href: "/", label: "Inicio" },
  { href: "/blog", label: "Blog" },
  { href: "/acerca", label: "Acerca" },
  { href: "/contacto", label: "Contacto" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo />
          <p className="max-w-xs text-center text-sm text-muted-foreground md:text-left">
            El asistente de IA para contadores, respaldado en la normativa de
            ARCA/AFIP.
          </p>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {siteConfig.contactEmail}
          </a>
        </div>
        <nav
          aria-label="Pie de página"
          className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:gap-5 md:items-start md:text-left"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-sm text-muted-foreground md:max-w-[16rem] md:text-right">
          © {year} {siteConfig.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}