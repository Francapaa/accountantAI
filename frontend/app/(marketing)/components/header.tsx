import Link from "next/link";
import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";
import { Logo } from "./logo";

const navLinks = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#preguntas-frecuentes", label: "Preguntas frecuentes" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${siteConfig.contactEmail}?subject=Solicito%20acceso%20a%20AccountantAI`}
            className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
          >
            Solicitar acceso
          </a>
        </div>
      </div>
    </header>
  );
}
