import Link from "next/link";

import { buttonVariants } from "@/lib/components/ui/button";
import { Logo } from "@/lib/components/logo";
import { cn } from "@/lib/utils";

import { Footer } from "./footer";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
] as const;

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
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
            <Link
              href="/auth/sign-in"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/sign-up"
              className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}