"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

type MobileNavProps = {
  items: NavItem[];
};

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <div
        id="menu-mobile"
        className={cn(
          "absolute inset-x-0 top-full z-50 origin-top border-b border-border/70 bg-background/95 backdrop-blur transition-[opacity,transform] duration-200 ease-out",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <nav
          aria-label="Menú principal móvil"
          className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-2 border-t border-border/60 pt-4">
            <Link
              href="/auth/sign-in"
              className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
            >
              Ingresar
            </Link>
            <Link
              href="/auth/sign-up"
              className={cn(
                buttonVariants(),
                "flex-1 bg-gradient-to-r from-accent to-[oklch(0.45_0.12_235)] shadow-[0_8px_16px_-8px_rgb(0_0_0_/_0.35)]",
              )}
            >
              Empezá gratis
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}