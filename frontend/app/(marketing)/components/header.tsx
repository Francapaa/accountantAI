import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/lib/components/logo";
import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";

import { MobileNav } from "./mobile-nav";

const navLinks = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#preguntas-frecuentes", label: "Preguntas frecuentes" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
            >
              {link.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-200 ease-out group-hover:scale-x-100"
              />
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/auth/sign-in"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Ingresar
          </Link>
          <Link
            href="/auth/sign-up"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-gradient-to-r from-accent to-[oklch(0.45_0.12_235)] shadow-[0_8px_16px_-8px_rgb(0_0_0_/_0.35)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_20px_-8px_rgb(0_0_0_/_0.4)] hidden sm:inline-flex",
            )}
          >
            Empezá gratis
            <ArrowRight className="transition-transform group-hover/button:translate-x-0.5" />
          </Link>
        </div>
        <div className="md:hidden">
          <MobileNav items={[...navLinks]} />
        </div>
      </div>
    </header>
  );
}