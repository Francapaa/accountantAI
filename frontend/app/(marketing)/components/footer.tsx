import { siteConfig } from "@/lib/config/site";
import { Logo } from "./logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            El asistente de IA para contadores, respaldado en la normativa de
            ARCA/AFIP.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="transition-colors hover:text-foreground"
          >
            {siteConfig.contactEmail}
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          © {year} {siteConfig.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
